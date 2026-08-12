import os
from dotenv import load_dotenv

load_dotenv()

def _fix_db_url(url):
    """Supabase gives postgres:// but SQLAlchemy requires a specific dialect."""
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+pg8000://", 1)
    elif url and url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+pg8000://", 1)
    return url


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    FRONTEND_ORIGINS = [
        origin.strip()
        for origin in os.environ.get(
            "FRONTEND_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    SQLALCHEMY_DATABASE_URI = _fix_db_url(
        os.environ.get("DATABASE_URL", "sqlite:////tmp/taskmanager.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,       # reconnect on stale connections (serverless)
        "pool_recycle": 300,         # recycle connections every 5 min
    }
