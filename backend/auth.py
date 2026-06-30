"""Authentication using ONLY the Python standard library.

No third-party crypto deps (no bcrypt / pyjwt) so the build on Render's free
tier can't fail on a compiled wheel. Passwords use PBKDF2-HMAC-SHA256; tokens
are compact HMAC-SHA256 signed JSON (a minimal JWT-style token).
"""
import os
import json
import hmac
import base64
import hashlib
import datetime

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import models
from database import get_db, SessionLocal

# Stable secret across restarts (Render: JWT_SECRET via generateValue:true).
SECRET = (os.getenv("JWT_SECRET") or "dev-insecure-secret-change-me").encode("utf-8")
TOKEN_TTL_HOURS = 24 * 7  # 1 semana
PBKDF2_ITERATIONS = 200_000

# Only used to read the "Authorization: Bearer <token>" header; login is JSON.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


# --- password hashing (PBKDF2) ---
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode(),
        base64.b64encode(dk).decode(),
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters, salt_b64, hash_b64 = (stored or "").split("$")
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), base64.b64decode(salt_b64), int(iters)
        )
        return hmac.compare_digest(dk, base64.b64decode(hash_b64))
    except Exception:
        return False


# --- token (HMAC-signed JSON) ---
def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _sign(body: str) -> str:
    return _b64url(hmac.new(SECRET, body.encode(), hashlib.sha256).digest())


def create_access_token(user: models.User) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_TTL_HOURS)
    payload = {"sub": user.username, "role": user.role, "uid": user.id, "exp": int(exp.timestamp())}
    body = _b64url(json.dumps(payload, separators=(",", ":")).encode())
    return f"{body}.{_sign(body)}"


def _decode_token(token: str):
    try:
        body, sig = token.split(".")
        if not hmac.compare_digest(sig, _sign(body)):
            return None
        payload = json.loads(_b64url_decode(body))
        if int(payload.get("exp", 0)) < int(datetime.datetime.utcnow().timestamp()):
            return None
        return payload
    except Exception:
        return None


# --- FastAPI dependencies ---
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    creds_exc = HTTPException(
        status_code=401, detail="No autenticado", headers={"WWW-Authenticate": "Bearer"}
    )
    payload = _decode_token(token) if token else None
    if not payload:
        raise creds_exc
    user = db.query(models.User).filter(models.User.username == payload.get("sub")).first()
    if not user:
        raise creds_exc
    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Requiere rol de administrador")
    return user


def seed_admin():
    """Create the bootstrap admin (from env) if no admin exists yet."""
    db = SessionLocal()
    try:
        if db.query(models.User).filter(models.User.role == "admin").first():
            return
        db.add(
            models.User(
                username=os.getenv("ADMIN_USERNAME") or "admin",
                full_name="Administrador",
                hashed_password=hash_password(os.getenv("ADMIN_PASSWORD") or "admin123"),
                role="admin",
            )
        )
        db.commit()
    finally:
        db.close()
