import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///taskmanager.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Outgoing email for reminders (SMTP credentials)
    REMINDER_EMAIL = os.environ.get("REMINDER_EMAIL", "")  # fallback recipient
    SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
    SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

    # Reminder scheduling
    REMINDER_HOUR = int(os.environ.get("REMINDER_HOUR", 8))
    REMINDER_MINUTE = int(os.environ.get("REMINDER_MINUTE", 0))
    REMINDER_WINDOW_DAYS = int(os.environ.get("REMINDER_WINDOW_DAYS", 3))

    # Secret token required to call /api/trigger-reminder from an external scheduler
    REMINDER_TRIGGER_TOKEN = os.environ.get("REMINDER_TRIGGER_TOKEN", "change-me-token")

    # Set to "true" to also run an in-process APScheduler (fine for local dev or
    # an always-on host; on free-tier hosts that sleep, rely on the trigger endpoint instead)
    ENABLE_INPROCESS_SCHEDULER = os.environ.get("ENABLE_INPROCESS_SCHEDULER", "false").lower() == "true"
