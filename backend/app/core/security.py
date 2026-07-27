from passlib.context import CryptContext
import os
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv
import logging
from cryptography.fernet import Fernet, InvalidToken

load_dotenv()
# Configuration for JWTs
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Password Hashing setup using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a provided password matches the hashed version."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Converts a raw password into a secure hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    """Generates a signed JWT."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Generates a signed refresh JWT."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

logger = logging.getLogger(__name__)

# --- NEW: TWO-WAY ENCRYPTION FOR DATABASE CREDENTIALS ---

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    logger.warning("🚨 WARNING: No ENCRYPTION_KEY found! Using local fallback.")
    ENCRYPTION_KEY = b'your-32-byte-base64-secret-key-goes-here123='

try:
    cipher_suite = Fernet(ENCRYPTION_KEY)
except ValueError:
    logger.error("💥 CRITICAL: Invalid ENCRYPTION_KEY format.")
    raise

def encrypt_db_password(plain_text: str) -> str:
    """Symmetrically encrypts a database password."""
    if not plain_text:
        return ""
    return cipher_suite.encrypt(plain_text.encode('utf-8')).decode('utf-8')

def decrypt_db_password(cipher_text: str) -> str:
    """Decrypts ciphertext back into the plaintext database password."""
    if not cipher_text:
        return ""
    try:
        return cipher_suite.decrypt(cipher_text.encode('utf-8')).decode('utf-8')
    except InvalidToken:
        raise ValueError("Decryption failed. The stored password may be corrupted.")