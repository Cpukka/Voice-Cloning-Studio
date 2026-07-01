from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import ssl

# Configure SSL for Neon connection
connect_args = {}
if "neon.tech" in settings.database_url:
    # Neon requires SSL
    connect_args = {
        "sslmode": "require",
        "connect_timeout": 10,
    }

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,  # Check connection before using
    pool_recycle=3600,    # Recycle connections every hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()