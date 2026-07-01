import numpy as np
import wave
import io
import uuid
import struct
import math
from pathlib import Path
from typing import Optional, Tuple
import json
import random

class TTSService:
    def __init__(self):
        self.use_mock = True  # Use mock TTS for Windows
        print("✅ TTS Service initialized (mock mode for Windows)")
    
    def generate_sine_wave(self, frequency: float, duration: float, sample_rate: int = 22050) -> bytes:
        """Generate a sine wave audio for testing"""
        t = np.linspace(0, duration, int(sample_rate * duration))
        # Create sine wave
        wave_data = 0.5 * np.sin(2 * np.pi * frequency * t)
        
        # Convert to 16-bit PCM
        wave_data_int = (wave_data * 32767).astype(np.int16)
        
        # Create WAV file in memory
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(wave_data_int.tobytes())
        
        buffer.seek(0)
        return buffer.read()
    
    def generate_mock_voice(self, text: str, voice_id: str, speed: float = 1.0) -> Tuple[bytes, float]:
        """Generate a mock voice based on text and voice ID"""
        # Calculate duration based on text length (approx 15 chars per second)
        base_duration = max(1.0, len(text) / 15.0)
        duration = base_duration / speed
        
        # Create a unique frequency based on voice_id and text
        voice_hash = hash(voice_id) % 1000
        text_hash = sum(ord(c) for c in text[:20]) % 500
        base_frequency = 200 + (voice_hash % 400) + (text_hash % 200)
        
        # Add some variation based on text content
        freq_variation = math.sin(text_hash / 100) * 50
        
        # Generate audio with some "voice-like" characteristics
        audio_parts = []
        
        # Split text into words to create pauses
        words = text.split()
        for i, word in enumerate(words):
            word_duration = max(0.3, len(word) / 15.0) / speed
            freq = base_frequency + freq_variation * math.sin(i)
            audio_part = self.generate_sine_wave(freq, word_duration)
            audio_parts.append(audio_part)
            
            # Add small pause between words
            if i < len(words) - 1:
                pause = self.generate_sine_wave(0, 0.05)  # Silence
                audio_parts.append(pause)
        
        # Combine all parts
        combined_audio = b''.join(audio_parts)
        
        return combined_audio, duration
    
    def generate_speech(self, text: str, voice_model_path: str, speed: float = 1.0) -> Tuple[Optional[bytes], float]:
        """Generate speech - mock version for Windows testing"""
        try:
            if not text or len(text.strip()) == 0:
                return None, 0
            
            # Extract voice ID from path
            voice_id = str(uuid.uuid4())
            if voice_model_path:
                parts = voice_model_path.split('/')
                if len(parts) > 0:
                    voice_id = parts[-1]
            
            # Generate mock audio
            audio_bytes, duration = self.generate_mock_voice(text, voice_id, speed)
            
            # Simulate processing time
            import time
            time.sleep(0.3)
            
            print(f"✅ Generated speech: {len(text)} chars, {duration:.1f}s duration")
            return audio_bytes, duration
            
        except Exception as e:
            print(f"❌ TTS generation failed: {e}")
            return None, 0
    
    def cleanup_temp_files(self):
        """Clean up temporary files"""
        pass

tts_service = TTSService()