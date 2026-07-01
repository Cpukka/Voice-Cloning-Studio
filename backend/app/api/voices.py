from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.voice import VoiceModel
from ..schemas.voice import VoiceCreate, VoiceResponse, VoiceCloneRequest
from ..services.voice_cloner import voice_cloner
from ..services.storage import storage_service
import uuid

router = APIRouter(prefix="/voices", tags=["voice management"])

@router.post("/upload")
async def upload_voice(
    name: str,
    file: UploadFile = File(...),
    description: str = None,
    is_public: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/mp3"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only WAV, MP3 audio files are allowed"
        )
    
    # Read file content
    content = await file.read()
    
    # Create voice model record
    voice_model = VoiceModel(
        user_id=current_user.id,
        name=name,
        description=description,
        model_path="",
        status="processing",
        is_public=is_public
    )
    db.add(voice_model)
    db.commit()
    db.refresh(voice_model)
    
    # Upload raw audio to storage
    file_extension = file.filename.split('.')[-1]
    audio_path = f"uploads/{current_user.id}/{voice_model.id}/sample.{file_extension}"
    audio_url = storage_service.upload_file(content, audio_path, file.content_type)
    
    # Process voice cloning
    try:
        model_path = voice_cloner.clone_voice(content, voice_model.id, current_user.id)
        if model_path:
            voice_model.model_path = model_path
            voice_model.sample_audio_url = audio_url
            voice_model.status = "ready"
        else:
            voice_model.status = "failed"
    except Exception as e:
        voice_model.status = "failed"
        raise HTTPException(status_code=500, detail=f"Voice cloning failed: {str(e)}")
    
    db.commit()
    
    return {"message": "Voice uploaded and processing started", "voice_id": voice_model.id}

@router.get("/", response_model=List[VoiceResponse])
def list_voices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    include_public: bool = True
):
    query = db.query(VoiceModel).filter(VoiceModel.user_id == current_user.id)
    
    if include_public:
        public_voices = db.query(VoiceModel).filter(VoiceModel.is_public == True)
        voices = query.union(public_voices).all()
    else:
        voices = query.all()
    
    return voices

@router.get("/{voice_id}", response_model=VoiceResponse)
def get_voice(
    voice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    voice = db.query(VoiceModel).filter(VoiceModel.id == voice_id).first()
    
    if not voice:
        raise HTTPException(status_code=404, detail="Voice not found")
    
    if voice.user_id != current_user.id and not voice.is_public and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return voice

@router.delete("/{voice_id}")
def delete_voice(
    voice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    voice = db.query(VoiceModel).filter(VoiceModel.id == voice_id).first()
    
    if not voice:
        raise HTTPException(status_code=404, detail="Voice not found")
    
    if voice.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(voice)
    db.commit()
    
    return {"message": "Voice deleted successfully"}

@router.post("/{voice_id}/clone", response_model=VoiceResponse)
def clone_existing_voice(
    voice_id: int,
    request: VoiceCloneRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    source_voice = db.query(VoiceModel).filter(VoiceModel.id == voice_id).first()
    
    if not source_voice:
        raise HTTPException(status_code=404, detail="Source voice not found")
    
    # Create cloned voice for current user
    new_voice = VoiceModel(
        user_id=current_user.id,
        name=f"Clone of {source_voice.name}",
        description=source_voice.description,
        model_path=source_voice.model_path,
        status="ready",
        is_public=False
    )
    
    db.add(new_voice)
    db.commit()
    db.refresh(new_voice)
    
    return new_voice