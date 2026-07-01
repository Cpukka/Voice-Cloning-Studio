import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash

def init_db():
    """Create database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    return True

def seed_database():
    """Seed initial users"""
    db = SessionLocal()
    
    try:
        # Create demo user
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
            print("✅ Demo user created (username: demouser, password: demo123456)")
        else:
            print("ℹ️ Demo user already exists")
        
        # Create admin user
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
            print("✅ Admin user created (username: admin, password: admin123456)")
        else:
            print("ℹ️ Admin user already exists")
        
        db.commit()
        print("\n✅ Database seeding completed successfully!")
        
        # Print summary
        print("\n📋 Account Summary:")
        print("-" * 40)
        print("Regular User:")
        print("  Username: demouser")
        print("  Password: demo123456")
        print("\nAdmin User:")
        print("  Username: admin")
        print("  Password: admin123456")
        print("-" * 40)
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initializing database...")
    if init_db():
        seed_database()
    else:
        print("❌ Failed to initialize database. Please check your database connection.")