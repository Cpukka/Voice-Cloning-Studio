from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_current_user, verify_api_key
from ..models.user import User
from ..models.voice import VoiceModel
from ..models.audio import GeneratedAudio
from ..schemas.tts import TTSRequest, TTSResponse
from ..services.tts_service import tts_service
from ..services.storage import storage_service
from typing import Optional
import uuid

router = APIRouter(prefix="/tts", tags=["text-to-speech"])

@router.post("/generate", response_model=TTSResponse)
async def generate_speech(
    request: TTSRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
    api_key_valid: bool = False
):
    # Check if authenticated via JWT or API key
    if not current_user and not api_key_valid:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get user from either method
    user_id = current_user.id if current_user else api_key_valid
    
    # Verify voice model access
    voice = db.query(VoiceModel).filter(VoiceModel.id == request.voice_id).first()
    if not voice:
        raise HTTPException(status_code=404, detail="Voice model not found")
    
    if voice.user_id != user_id and not voice.is_public:
        user = db.query(User).filter(User.id == user_id).first()
        if user.role != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate speech
    try:
        audio_content, duration = tts_service.generate_speech(
            text=request.text,
            voice_model_path=voice.model_path,
            speed=request.speed
        )
        
        if not audio_content:
            raise HTTPException(status_code=500, detail="Speech generation failed")
        
        # Save audio file
        audio_filename = f"generated/{user_id}/{voice.id}/{uuid.uuid4()}.wav"
        audio_url = storage_service.upload_file(audio_content, audio_filename, "audio/wav")
        
        # Save to database
        generated_audio = GeneratedAudio(
            user_id=user_id,
            voice_model_id=voice.id,
            text=request.text,
            audio_url=audio_url,
            file_size=len(audio_content),
            duration=duration
        )
        db.add(generated_audio)
        db.commit()
        
        # Cleanup in background (for temp files if any)
        background_tasks.add_task(tts_service.cleanup_temp_files)
        
        return TTSResponse(
            audio_url=audio_url,
            duration=duration,
            file_size=len(audio_content)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@router.get("/history")
def get_generation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    history = db.query(GeneratedAudio).filter(
        GeneratedAudio.user_id == current_user.id
    ).order_by(
        GeneratedAudio.created_at.desc()
    ).limit(limit).offset(offset).all()
    
    return history

@router.get("/download/{audio_id}")
def download_audio(
    audio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    audio = db.query(GeneratedAudio).filter(GeneratedAudio.id == audio_id).first()
    
    if not audio:
        raise HTTPException(status_code=404, detail="Audio not found")
    
    if audio.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Extract file path from URL
    file_path = audio.audio_url.split("/storage/")[-1] if "/storage/" in audio.audio_url else audio.audio_url.split(".com/")[-1]
    
    content = storage_service.download_file(file_path)
    if not content:
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    from fastapi.responses import Response
    return Response(content=content, media_type="audio/wav", headers={
        "Content-Disposition": f"attachment; filename=speech_{audio_id}.wav"
    })