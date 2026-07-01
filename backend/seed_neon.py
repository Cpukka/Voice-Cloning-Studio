import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.voice import VoiceModel
from app.models.audio import GeneratedAudio
from app.models.api_key import APIKey
from app.core.security import get_password_hash

def seed_neon_database():
    print("🚀 Setting up Neon PostgreSQL database...")
    
    # Create all tables
    print("📊 Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if users exist
        demo_user = db.query(User).filter(User.username == "demouser").first()
        if not demo_user:
            demo_user = User(
                username="demouser",
                email="demo@voicestudio.com",
                hashed_password=get_password_hash("demo123456"),
                role="user",
                is_active=True
            )
            db.add(demo_user)
            print("✅ Demo user created")
        
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@voicestudio.com",
                hashed_password=get_password_hash("admin123456"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            print("✅ Admin user created")
        
        db.commit()
        
        # Verify data
        user_count = db.query(User).count()
        print(f"\n📈 Database Stats:")
        print(f"  Total users: {user_count}")
        
        print("\n✅ Database seeding completed successfully!")
        print("\n🔐 Login Credentials:")
        print("  Regular User: demouser / demo123456")
        print("  Admin User: admin / admin123456")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_neon_database()