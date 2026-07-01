from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VoiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class VoiceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    sample_audio_url: Optional[str]
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class VoiceCloneRequest(BaseModel):
    voice_id: int