import hmac
import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Secure password hashing using PBKDF2 with SHA-256 and per-user salt."""
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${key}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored salt and PBKDF2 hash."""
    try:
        salt, stored_key = hashed_password.split('$')
        computed_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(stored_key, computed_key)
    except Exception:
        return False

def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    """Encode user subject into signed JWT token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    """Decode and validate JWT token; returns subject identifier if valid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
