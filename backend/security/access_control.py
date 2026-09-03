def check_permission(role, action):
    permissions = {
        "investigator": ["UPLOAD"],
        "officer": ["VERIFY"],
        "auditor": ["VIEW_LOGS"]
    }
    return action in permissions.get(role, [])
