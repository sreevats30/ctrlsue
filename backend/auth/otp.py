import random
import time

# user_id -> { otp, expires_at }
otp_store = {}

OTP_EXPIRY_SECONDS = 120  # 2 minutes

def generate_otp(user_id):
    otp = str(random.randint(100000, 999999))
    expires_at = time.time() + OTP_EXPIRY_SECONDS

    otp_store[user_id] = {
        "otp": otp,
        "expires_at": expires_at
    }

    # Demo only (in real life: email / SMS)
    print(f"OTP (demo) for authenticated user: {otp}")

    return otp


def verify_otp(user_id, otp):
    record = otp_store.get(user_id)

    if not record:
        return False, "OTP not generated"

    # Expired
    if time.time() > record["expires_at"]:
        otp_store.pop(user_id, None)
        return False, "OTP expired"

    # Incorrect
    if record["otp"] != otp:
        return False, "Invalid OTP"

    # Success → remove OTP (one-time use)
    otp_store.pop(user_id, None)
    return True, "OTP verified"
