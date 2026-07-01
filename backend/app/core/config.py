from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL", "")
    
    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-key")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AWS S3
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_bucket_name: str = "voice-cloning-studio"
    aws_region: str = "us-east-1"
    use_s3: bool = False
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # API
    api_version: str = "v1"
    debug: bool = True
    
    # CORS - Parse from string or use default
    allowed_origins_str: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    
    @property
    def allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins_str.split(",")]
    
    # Voice Models
    voice_model_path: str = "./models/voice_cloning"
    tts_model_path: str = "./models/tts"
    max_audio_duration: int = 30
    sample_rate: int = 22050
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()