from models import db, AuditLog

def log_action(user_id, action, result, evidence_id=None):
    log = AuditLog(
        user_id=user_id,
        action=action,
        result=result,
        evidence_id=evidence_id
    )
    db.session.add(log)
    db.session.commit()
