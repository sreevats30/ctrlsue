from flask import Blueprint, request, jsonify
from models import db, User
import bcrypt
from auth.otp import generate_otp, verify_otp

auth_bp = Blueprint("auth", __name__)

# ------------------------
# SIGN UP
# ------------------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json

    if not all(k in data for k in ("username", "password", "role")):
        return jsonify({"error": "Missing fields"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 409

    pw_hash = bcrypt.hashpw(
        data["password"].encode(),
        bcrypt.gensalt()
    )

    user = User(
        username=data["username"],
        password_hash=pw_hash.decode(),
        role=data["role"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user_id": user.id,
        "username": user.username,
    }), 201


# ------------------------
# LOGIN (PASSWORD)
# ------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    if not all(k in data for k in ("username", "password")):
        return jsonify({"error": "Missing credentials"}), 400

    user = User.query.filter_by(username=data["username"]).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(
        data["password"].encode(),
        user.password_hash.encode()
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate OTP (printed in console for demo)
    generate_otp(user.id)

    return jsonify({
        "message": "OTP generated",
        "user_id": user.id
    }), 200


# ------------------------
# VERIFY OTP (MFA)
# ------------------------
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp_route():
    data = request.json

    if not all(k in data for k in ("user_id", "otp")):
        return jsonify({"error": "Missing fields"}), 400

    valid, message = verify_otp(data["user_id"], data["otp"])

    if not valid:
        return jsonify({"error": message}), 401

    user = db.session.get(User, data["user_id"])

    return jsonify({
        "message": "Authentication successful",
        "role": user.role
    }), 200
