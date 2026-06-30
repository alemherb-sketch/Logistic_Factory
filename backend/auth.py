import os
import datetime

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import models
from database import get_db, SessionLocal

# Stable secret across restarts (Render: set JWT_SECRET with generateValue:true).
JWT_SECRET = os.getenv("JWT_SECRET") or "dev-insecure-secret-change-me"
JWT_ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 24 * 7  # 1 semana

# Only used to pull the "Authorization: Bearer <token>" header; login is JSON.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), (hashed or "").encode("utf-8"))
    except Exception:
        return False


def create_access_token(user: models.User) -> str:
    payload = {
        "sub": user.username,
        "role": user.role,
        "uid": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    creds_exc = HTTPException(
        status_code=401, detail="No autenticado", headers={"WWW-Authenticate": "Bearer"}
    )
    if not token:
        raise creds_exc
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
    except Exception:
        raise creds_exc
    user = db.query(models.User).filter(models.User.username == username).first()
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
        username = os.getenv("ADMIN_USERNAME") or "admin"
        password = os.getenv("ADMIN_PASSWORD") or "admin123"
        db.add(
            models.User(
                username=username,
                full_name="Administrador",
                hashed_password=hash_password(password),
                role="admin",
            )
        )
        db.commit()
    finally:
        db.close()
