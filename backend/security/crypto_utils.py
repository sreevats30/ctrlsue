import os
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from hashlib import sha256
from config import Config

# --------------------------------------------------
# KEY STORAGE
# --------------------------------------------------
KEY_DIR = "keys"
PRIVATE_KEY_PATH = os.path.join(KEY_DIR, "private_key.pem")
PUBLIC_KEY_PATH = os.path.join(KEY_DIR, "public_key.pem")

os.makedirs(KEY_DIR, exist_ok=True)

# --------------------------------------------------
# LOAD OR CREATE RSA KEYS
# --------------------------------------------------
def load_or_create_keys():
    if os.path.exists(PRIVATE_KEY_PATH):
        with open(PRIVATE_KEY_PATH, "rb") as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=None,
                backend=default_backend()
            )
    else:
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(
                private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                )
            )

    if os.path.exists(PUBLIC_KEY_PATH):
        with open(PUBLIC_KEY_PATH, "rb") as f:
            public_key = serialization.load_pem_public_key(
                f.read(),
                backend=default_backend()
            )
    else:
        public_key = private_key.public_key()
        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(
                public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                )
            )

    return private_key, public_key


private_key, public_key = load_or_create_keys()

# --------------------------------------------------
# HASHING
# --------------------------------------------------
def hash_data(data: bytes) -> bytes:
    digest = hashes.Hash(hashes.SHA256())
    digest.update(data)
    return digest.finalize()

# --------------------------------------------------
# DIGITAL SIGNATURES
# --------------------------------------------------
def sign_hash(file_hash: bytes) -> bytes:
    return private_key.sign(
        file_hash,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

def verify_signature(file_hash: bytes, signature: bytes) -> bool:
    try:
        public_key.verify(
            signature,
            file_hash,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False

# --------------------------------------------------
# AES ENCRYPTION / DECRYPTION
# --------------------------------------------------
def _get_aes_key():
    return sha256(Config.SECRET_KEY.encode()).digest()

def encrypt_file(data: bytes) -> bytes:
    key = _get_aes_key()
    iv = os.urandom(16)

    cipher = Cipher(
        algorithms.AES(key),
        modes.CFB(iv),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(data) + encryptor.finalize()

    # IV + ciphertext
    return iv + ciphertext

def decrypt_file(encrypted_data: bytes) -> bytes:
    key = _get_aes_key()
    iv = encrypted_data[:16]
    ciphertext = encrypted_data[16:]

    cipher = Cipher(
        algorithms.AES(key),
        modes.CFB(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    return decryptor.update(ciphertext) + decryptor.finalize()
