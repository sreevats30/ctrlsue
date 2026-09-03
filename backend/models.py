from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


# ------------------------
# USER
# ------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False)  # investigator, officer, auditor


# ------------------------
# EVIDENCE
# ------------------------
class Evidence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    encrypted_path = db.Column(db.String(300), nullable=False)
    file_hash = db.Column(db.String(128), nullable=False)
    signature = db.Column(db.Text, nullable=False)

    uploaded_by = db.Column(db.Integer, nullable=False)  # User.id
    note = db.Column(db.Text)  # Investigator notes

    created_at = db.Column(db.DateTime, default=datetime.utcnow)



# ------------------------
# AUDIT LOG
# ------------------------
class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    action = db.Column(db.String(200), nullable=False)
    evidence_id = db.Column(db.Integer, nullable=True)
    result = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
