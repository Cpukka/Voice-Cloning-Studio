from pydantic import BaseModel
from typing import Optional

class TTSRequest(BaseModel):
    text: str
    voice_id: int
    speed: float = 1.0

class TTSResponse(BaseModel):
    audio_url: str
    duration: float
    file_size: int

class APIKeyCreate(BaseModel):
    name: str

class APIKeyResponse(BaseModel):
    id: int
    name: str
    key: str
    created_at: datetime
    expires_at: Optional[datetime]