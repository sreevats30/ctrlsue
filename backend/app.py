from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from io import BytesIO
import os
import mimetypes

from config import Config
from models import db, Evidence, AuditLog , User
from auth.auth_routes import auth_bp
from security.crypto_utils import (
    encrypt_file,
    decrypt_file,
    hash_data,
    sign_hash,
    verify_signature
)
from security.access_control import check_permission
from security.encoding_utils import encode_base64, decode_base64
from audit.audit_logger import log_action

# --------------------------------------------------
# APP SETUP
# --------------------------------------------------
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db.init_app(app)
app.register_blueprint(auth_bp, url_prefix="/auth")

# --------------------------------------------------
# INIT
# --------------------------------------------------
with app.app_context():
    db.create_all()
    os.makedirs("encrypted_storage", exist_ok=True)

# --------------------------------------------------
# UPLOAD EVIDENCE (INVESTIGATOR)
# --------------------------------------------------
@app.route("/upload", methods=["POST"])
def upload():
    role = request.form.get("role")
    user_id = request.form.get("user_id")
    note = request.form.get("note")

    if not check_permission(role, "UPLOAD"):
        log_action(user_id, "UPLOAD", "DENIED")
        return jsonify({"error": "Unauthorized"}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename)

    # Read original file
    original_data = file.read()

    # Encrypt
    encrypted_data = encrypt_file(original_data)

    # Integrity protection
    file_hash = hash_data(original_data)
    raw_signature = sign_hash(file_hash)
    signature = encode_base64(raw_signature)


    # Store encrypted file
    path = f"encrypted_storage/{filename}.enc"
    with open(path, "wb") as f:
        f.write(encrypted_data)

    evidence = Evidence(
        filename=filename,
        encrypted_path=path,
        file_hash=file_hash.hex(),
        signature=signature,
        uploaded_by=user_id,
        note=note
    )

    db.session.add(evidence)
    db.session.commit()

    log_action(user_id, "UPLOAD", "SUCCESS", evidence.id)

    return jsonify({
        "message": "Evidence uploaded securely",
        "evidence_id": evidence.id
    }), 201

# --------------------------------------------------
# VIEW OWN EVIDENCE (INVESTIGATOR – METADATA ONLY)
# --------------------------------------------------
@app.route("/my-evidence/<int:user_id>", methods=["GET"])
def my_evidence(user_id):
    evidences = Evidence.query.filter_by(uploaded_by=user_id).all()

    return jsonify([
        {
            "id": e.id,
            "filename": e.filename,
            "note": e.note,
            "created_at": e.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for e in evidences
    ])

# --------------------------------------------------
# LIST ALL EVIDENCE (FORENSIC OFFICER)
# --------------------------------------------------
@app.route("/all-evidence", methods=["GET"])
def all_evidence():
    role = request.args.get("role")
    user_id = request.args.get("user_id")

    if role != "officer":
        log_action(user_id, "LIST_EVIDENCE", "DENIED")
        return jsonify({"error": "Unauthorized"}), 403

    records = (
        db.session.query(Evidence, User)
        .join(User, Evidence.uploaded_by == User.id)
        .order_by(Evidence.created_at.desc())
        .all()
    )

    log_action(user_id, "LIST_EVIDENCE", "SUCCESS")

    return jsonify([
        {
            "id": e.id,
            "filename": e.filename,
            "uploaded_by_id": u.id,
            "uploaded_by_name": u.username,
            "uploaded_by_role": u.role,
            "created_at": e.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for e, u in records
    ])


# --------------------------------------------------
# VIEW / DECRYPT EVIDENCE (INVESTIGATOR / OFFICER)
# --------------------------------------------------
@app.route("/view-evidence/<int:eid>", methods=["GET"])
def view_evidence(eid):
    role = request.args.get("role")
    user_id = request.args.get("user_id")

    if role not in ["investigator", "officer"]:
        log_action(user_id, "VIEW", "DENIED", eid)
        return jsonify({"error": "Unauthorized"}), 403

    evidence = Evidence.query.get(eid)
    if not evidence:
        return jsonify({"error": "Evidence not found"}), 404

    if role == "investigator" and str(evidence.uploaded_by) != str(user_id):
        log_action(user_id, "VIEW", "DENIED", eid)
        return jsonify({"error": "Access denied"}), 403

    try:
        with open(evidence.encrypted_path, "rb") as f:
            encrypted_data = f.read()
    except FileNotFoundError:
        return jsonify({"error": "Encrypted file missing"}), 500

    decrypted_data = decrypt_file(encrypted_data)
    mime_type, _ = mimetypes.guess_type(evidence.filename)

    log_action(user_id, "VIEW", "SUCCESS", eid)

    return send_file(
        BytesIO(decrypted_data),
        mimetype=mime_type or "application/octet-stream",
        download_name=evidence.filename
    )

# --------------------------------------------------
# VERIFY EVIDENCE INTEGRITY (FORENSIC OFFICER)
# --------------------------------------------------
@app.route("/verify/<int:eid>", methods=["GET"])
def verify(eid):
    role = request.args.get("role")
    user_id = request.args.get("user_id")

    if not check_permission(role, "VERIFY"):
        log_action(user_id, "VERIFY", "DENIED", eid)
        return jsonify({"error": "Unauthorized"}), 403

    evidence = Evidence.query.get(eid)
    if not evidence:
        return jsonify({"error": "Evidence not found"}), 404

    try:
        with open(evidence.encrypted_path, "rb") as f:
            encrypted_data = f.read()
    except FileNotFoundError:
        log_action(user_id, "VERIFY", "FILE_MISSING", eid)
        return jsonify({"error": "Evidence file missing"}), 500

    #  Correct forensic verification flow
    decrypted_data = decrypt_file(encrypted_data)
    recalculated_hash = hash_data(decrypted_data)

    decoded_signature = decode_base64(evidence.signature)

    signature_valid = verify_signature(
        recalculated_hash,
        decoded_signature
    )


    if not signature_valid:
        log_action(user_id, "VERIFY", "TAMPER_DETECTED", eid)
        return jsonify({
            "valid": False,
            "message": "Tampering detected"
        }), 400

    log_action(user_id, "VERIFY", "VERIFIED", eid)
    return jsonify({
        "valid": True,
        "message": "Evidence integrity verified"
    }), 200

# --------------------------------------------------
# AUDIT LOGS (AUDITOR)
# --------------------------------------------------
@app.route("/audit-logs", methods=["GET"])
def audit_logs():
    role = request.args.get("role")

    if role != "auditor":
        return jsonify({"error": "Unauthorized"}), 403

    logs = (
        db.session.query(AuditLog, User)
        .join(User, AuditLog.user_id == User.id)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    return jsonify([
        {
            "username": user.username,
            "role": user.role,
            "action": log.action,
            "result": log.result,
            "evidence_id": log.evidence_id,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for log, user in logs
    ])


# --------------------------------------------------
# RUN SERVER
# --------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
