import os
import json
import io
from pathlib import Path
from typing import Optional, Tuple
import uuid
from datetime import datetime
from ..core.config import settings
from .storage import storage_service

class VoiceCloner:
    def __init__(self):
        self.initialized = True
        print("✅ Voice cloner initialized (Windows compatible mode)")
    
    def validate_audio_wav(self, audio_content: bytes) -> Tuple[bool, str, float]:
        """Validate WAV file without audioop"""
        try:
            # Check RIFF header
            if not audio_content.startswith(b'RIFF') or not audio_content[8:12] == b'WAVE':
                return False, "Not a valid WAV file", 0
            
            # Parse WAV header to get duration
            sample_rate = 0
            data_size = 0
            
            # Find fmt chunk
            pos = 12
            while pos + 8 < len(audio_content):
                chunk_id = audio_content[pos:pos+4]
                chunk_size = struct.unpack('<I', audio_content[pos+4:pos+8])[0]
                
                if chunk_id == b'fmt ':
                    if chunk_size >= 16:
                        sample_rate = struct.unpack('<I', audio_content[pos+12:pos+16])[0]
                        bytes_per_sec = struct.unpack('<I', audio_content[pos+16:pos+20])[0]
                elif chunk_id == b'data':
                    data_size = chunk_size
                    break
                
                pos += 8 + chunk_size
            
            if sample_rate > 0 and data_size > 0:
                duration = data_size / (sample_rate * 2)  # Assuming 16-bit stereo
                if duration < 3:
                    return False, f"Audio too short: {duration:.1f} seconds (min 3 seconds)", duration
                if duration > settings.max_audio_duration:
                    return False, f"Audio too long: {duration:.1f} seconds (max {settings.max_audio_duration} seconds)", duration
                return True, "Valid WAV file", duration
            
            return True, "Valid WAV file (could not parse duration)", 0
            
        except Exception as e:
            return False, f"WAV validation error: {str(e)}", 0
    
    def validate_audio(self, audio_content: bytes) -> Tuple[bool, str]:
        """Validate audio file"""
        try:
            # Check file size
            file_size_mb = len(audio_content) / (1024 * 1024)
            if file_size_mb > 50:
                return False, "Audio file too large (max 50MB)"
            
            if len(audio_content) < 10000:  # Less than 10KB
                return False, "Audio file too small (min 10KB)"
            
            # Check if it's a WAV file
            is_valid, message, duration = self.validate_audio_wav(audio_content)
            if is_valid:
                return True, message
            
            # Check if it's an MP3 file (ID3 header)
            if audio_content.startswith(b'ID3'):
                return True, "Valid MP3 file"
            
            return False, "Only WAV or MP3 files are supported"
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def process_audio_for_cloning(self, audio_content: bytes) -> Optional[dict]:
        """Process audio and return metadata"""
        is_valid, message = self.validate_audio(audio_content)
        if not is_valid:
            print(f"Audio validation failed: {message}")
            return None
        
        return {
            "size_bytes": len(audio_content),
            "size_mb": len(audio_content) / (1024 * 1024),
            "valid": True,
            "validation_message": message
        }
    
    def clone_voice(self, audio_content: bytes, voice_id: int, user_id: int) -> Optional[str]:
        """Clone voice - saves reference audio for TTS"""
        
        # Validate audio
        audio_info = self.process_audio_for_cloning(audio_content)
        if not audio_info:
            return None
        
        # Create model directory
        model_dir = Path(settings.voice_model_path) / str(user_id) / str(voice_id)
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # Determine file extension
        if audio_content.startswith(b'RIFF'):
            ext = 'wav'
        elif audio_content.startswith(b'ID3'):
            ext = 'mp3'
        else:
            ext = 'bin'
        
        # Save original audio for reference
        audio_filename = f"reference_audio.{ext}"
        audio_path = model_dir / audio_filename
        with open(audio_path, "wb") as f:
            f.write(audio_content)
        
        # Save metadata
        metadata = {
            "voice_id": voice_id,
            "user_id": user_id,
            "model_type": "reference_based",
            "created_at": datetime.now().isoformat(),
            "status": "ready",
            "audio_info": audio_info,
            "sample_rate": settings.sample_rate,
            "audio_file": audio_filename
        }
        
        metadata_path = model_dir / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        
        # Store in cloud storage if configured
        if settings.use_s3:
            with open(audio_path, "rb") as f:
                storage_service.upload_file(
                    f.read(),
                    f"voice_models/{user_id}/{voice_id}/{audio_filename}",
                    f"audio/{ext}"
                )
            
            with open(metadata_path, "rb") as f:
                storage_service.upload_file(
                    f.read(),
                    f"voice_models/{user_id}/{voice_id}/metadata.json",
                    "application/json"
                )
        
        print(f"✅ Voice cloned successfully: {model_dir}")
        return str(model_dir)

# Import struct for WAV parsing
import struct

voice_cloner = VoiceCloner()