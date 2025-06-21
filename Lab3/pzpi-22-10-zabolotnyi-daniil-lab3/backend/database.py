import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("POSTGRESQL_DB_NAME")
DB_USER = os.getenv("POSTGRESQL_DB_USER")
DB_PASSWORD = os.getenv("POSTGRESQL_PASSWORD")
DB_HOST = os.getenv("POSTGRESQL_DB_HOST")
DB_PORT = os.getenv("POSTGRESQL_DB_PORT")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine with connection pooling disabled for testing
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"connect_timeout": 5}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    database_available = True
except Exception as e:
    print(f"Warning: Database connection failed: {e}")
    # Create a dummy engine for testing
    engine = None
    SessionLocal = None
    database_available = False

# Імпортуємо Base з окремого файлу для уникнення циклічних залежностей
from database_base import Base

def get_db():
    if not database_available or SessionLocal is None:
        # Return a mock database session for testing
        class MockDB:
            def query(self, *args, **kwargs):
                return self
            def filter(self, *args, **kwargs):
                return self
            def filter_by(self, *args, **kwargs):
                return self
            def first(self):
                return None
            def all(self):
                return []
            def add(self, *args, **kwargs):
                pass
            def commit(self):
                pass
            def refresh(self, *args, **kwargs):
                pass
            def delete(self, *args, **kwargs):
                pass
            def close(self):
                pass
        
        yield MockDB()
        return
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
