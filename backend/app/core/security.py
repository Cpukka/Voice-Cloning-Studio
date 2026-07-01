from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..models.user import User
from ..models.api_key import APIKey
from ..core.database import get_db
from .config import settings

# Configure bcrypt with proper settings
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # Reasonable default
)

security = HTTPBearer()

def truncate_password(password: str, max_length: int = 72) -> str:
    """Truncate password to bcrypt's maximum length"""
    return password[:max_length]

def verify_password(plain_password, hashed_password):
    """Verify password with truncation"""
    truncated_password = truncate_password(plain_password)
    return pwd_context.verify(truncated_password, hashed_password)

def get_password_hash(password):
    """Hash password with truncation"""
    truncated_password = truncate_password(password)
    return pwd_context.hash(truncated_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def get_current_user(token: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, settings.secret_key, algorithms=[settings.algorithm])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def verify_api_key(api_key: str, db: Session) -> Optional[int]:
    """Verify API key and return user_id if valid"""
    key_record = db.query(APIKey).filter(
        APIKey.key == api_key,
        APIKey.is_active == True
    ).first()
    
    if not key_record:
        return None
    
    # Check expiration
    if key_record.expires_at and key_record.expires_at < datetime.utcnow():
        key_record.is_active = False
        db.commit()
        return None
    
    # Update last used
    key_record.last_used = datetime.utcnow()
    db.commit()
    
    return key_record.user_id

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user