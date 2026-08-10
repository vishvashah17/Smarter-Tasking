import os


def _fix_db_url(url):
    """Supabase gives postgres:// but SQLAlchemy 1.4+ requires postgresql://."""
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_DATABASE_URI = _fix_db_url(
        os.environ.get("DATABASE_URL", "sqlite:////tmp/taskmanager.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,       # reconnect on stale connections (serverless)
        "pool_recycle": 300,         # recycle connections every 5 min
    }
