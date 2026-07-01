from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.api_key import APIKey
from ..schemas.tts import APIKeyCreate, APIKeyResponse

router = APIRouter(prefix="/api-keys", tags=["api keys"])

def verify_api_key(api_key: str, db: Session):
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

@router.post("/create", response_model=APIKeyResponse)
def create_api_key(
    key_data: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Generate API key
    api_key = secrets.token_urlsafe(32)
    
    # Set expiration (1 year from now)
    expires_at = datetime.utcnow() + timedelta(days=365)
    
    db_key = APIKey(
        user_id=current_user.id,
        key=api_key,
        name=key_data.name,
        expires_at=expires_at
    )
    
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    return db_key

@router.get("/", response_model=list[APIKeyResponse])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).all()
    return keys

@router.delete("/{key_id}")
def revoke_api_key(
    key_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    key.is_active = False
    db.commit()
    
    return {"message": "API key revoked"}