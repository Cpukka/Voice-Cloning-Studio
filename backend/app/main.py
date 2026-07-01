from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import hashlib
import os
import uuid
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# ============ Configuration ============
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./voice_cloning.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ============ Database Setup ============
if "neon.tech" in DATABASE_URL or "postgresql" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============ Password Hashing ============
def hash_password(password: str) -> str:
    salt = "voicestudio_fixed_salt_2024"
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# ============ Models ============
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VoiceModel(Base):
    __tablename__ = "voice_models"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    description = Column(String, nullable=True)
    model_path = Column(String, nullable=True)
    sample_audio_url = Column(String, nullable=True)
    status = Column(String, default="processing")
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class GeneratedAudio(Base):
    __tablename__ = "generated_audio"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    voice_model_id = Column(Integer, ForeignKey("voice_models.id"))
    text = Column(String)
    audio_url = Column(String)
    file_size = Column(Integer, default=0)
    duration = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ============ Schemas ============
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class VoiceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    is_public: bool
    created_at: datetime

class TTSRequest(BaseModel):
    text: str
    voice_id: int
    speed: float = 1.0

class TTSResponse(BaseModel):
    audio_url: str
    duration: float
    file_size: int

# ============ Dependencies ============
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ FastAPI App ============
app = FastAPI(title="Voice Cloning Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ AUTH ROUTES ============
@app.post("/api/v1/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    if existing:
        raise HTTPException(400, "User already exists")
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/v1/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or db_user.hashed_password != hash_password(user.password):
        raise HTTPException(401, "Invalid credentials")
    token = jwt.encode(
        {"sub": str(db_user.id), "exp": datetime.utcnow() + timedelta(minutes=30)},
        SECRET_KEY, algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============ VOICE ROUTES ============
@app.get("/api/v1/voices", response_model=List[VoiceResponse])
def list_voices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all voices for the current user"""
    voices = db.query(VoiceModel).filter(VoiceModel.user_id == current_user.id).all()
    return voices

@app.post("/api/v1/voices/upload")
async def upload_voice(
    name: str = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    is_public: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a voice sample"""
    if file.content_type not in ["audio/wav", "audio/mpeg", "audio/mp3"]:
        raise HTTPException(400, "Only WAV and MP3 files are allowed")
    
    content = await file.read()
    
    voice = VoiceModel(
        user_id=current_user.id,
        name=name,
        description=description,
        status="ready",
        is_public=is_public
    )
    db.add(voice)
    db.commit()
    db.refresh(voice)
    
    upload_dir = f"./storage/uploads/{current_user.id}/{voice.id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = file.filename.split('.')[-1]
    file_path = f"{upload_dir}/sample.{file_extension}"
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    voice.model_path = file_path
    voice.sample_audio_url = f"/storage/{current_user.id}/{voice.id}/sample.{file_extension}"
    db.commit()
    
    return {
        "message": "Voice uploaded successfully",
        "voice_id": voice.id
    }

@app.get("/api/v1/voices/{voice_id}")
def get_voice(voice_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    voice = db.query(VoiceModel).filter(VoiceModel.id == voice_id).first()
    if not voice:
        raise HTTPException(404, "Voice not found")
    if voice.user_id != current_user.id and not voice.is_public:
        raise HTTPException(403, "Access denied")
    return voice

@app.delete("/api/v1/voices/{voice_id}")
def delete_voice(voice_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    voice = db.query(VoiceModel).filter(VoiceModel.id == voice_id).first()
    if not voice:
        raise HTTPException(404, "Voice not found")
    if voice.user_id != current_user.id:
        raise HTTPException(403, "Access denied")
    db.delete(voice)
    db.commit()
    return {"message": "Voice deleted"}

# ============ TTS ROUTES ============
@app.post("/api/v1/tts/generate", response_model=TTSResponse)
async def generate_speech(
    request: TTSRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    voice = db.query(VoiceModel).filter(VoiceModel.id == request.voice_id).first()
    if not voice:
        raise HTTPException(404, "Voice not found")
    if voice.user_id != current_user.id and not voice.is_public:
        raise HTTPException(403, "Access denied")
    
    duration = max(1.0, len(request.text) / 15.0) / request.speed
    
    audio_dir = f"./storage/generated/{current_user.id}/{voice.id}"
    os.makedirs(audio_dir, exist_ok=True)
    
    audio_filename = f"{uuid.uuid4()}.wav"
    audio_path = f"{audio_dir}/{audio_filename}"
    
    # Create a simple WAV file
    import wave
    import struct
    
    sample_rate = 22050
    num_samples = int(sample_rate * duration)
    
    with wave.open(audio_path, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for i in range(num_samples):
            value = int(32767 * 0.5 * (1 + i / num_samples))
            wav_file.writeframes(struct.pack('<h', value))
    
    audio_url = f"/storage/generated/{current_user.id}/{voice.id}/{audio_filename}"
    file_size = os.path.getsize(audio_path)
    
    generated = GeneratedAudio(
        user_id=current_user.id,
        voice_model_id=voice.id,
        text=request.text,
        audio_url=audio_url,
        file_size=file_size,
        duration=int(duration)
    )
    db.add(generated)
    db.commit()
    
    return {
        "audio_url": audio_url,
        "duration": duration,
        "file_size": file_size
    }

@app.get("/api/v1/tts/history")
def get_tts_history(
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
    
    return [
        {
            "id": h.id,
            "text": h.text,
            "audio_url": h.audio_url,
            "duration": h.duration,
            "file_size": h.file_size,
            "created_at": h.created_at
        }
        for h in history
    ]

@app.get("/api/v1/tts/download/{audio_id}")
def download_audio(
    audio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    audio = db.query(GeneratedAudio).filter(GeneratedAudio.id == audio_id).first()
    if not audio:
        raise HTTPException(404, "Audio not found")
    if audio.user_id != current_user.id:
        raise HTTPException(403, "Access denied")
    
    from fastapi.responses import FileResponse
    file_path = audio.audio_url.replace("/storage/", "./storage/")
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/wav", filename=f"speech_{audio_id}.wav")
    raise HTTPException(404, "Audio file not found")

# ============ HEALTH ============
@app.get("/")
def root():
    return {"message": "Voice Cloning API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# ============ SEED ============
@app.on_event("startup")
def seed_database():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "demouser").first():
            db.add(User(
                username="demouser",
                email="demo@voicestudio.com",
                hashed_password=hash_password("demo123456"),
                role="user"
            ))
            print("✅ Demo user created")
        
        if not db.query(User).filter(User.username == "admin").first():
            db.add(User(
                username="admin",
                email="admin@voicestudio.com",
                hashed_password=hash_password("admin123456"),
                role="admin"
            ))
            print("✅ Admin user created")
        
        db.commit()
        print("✅ Database seeded")
    except Exception as e:
        print(f"❌ Seeding error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)