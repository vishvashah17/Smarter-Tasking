import smtplib
from email.mime.text import MIMEText


def send_reminder_email(app, subject, body, recipient=None):
    """Send an email. If recipient is not provided, falls back to REMINDER_EMAIL config."""
    cfg = app.config
    if not (cfg["SMTP_USERNAME"] and cfg["SMTP_PASSWORD"]):
        app.logger.warning("Email not configured (SMTP_USERNAME/SMTP_PASSWORD) — skipping send.")
        return False

    to_addr = recipient or cfg.get("REMINDER_EMAIL")
    if not to_addr:
        app.logger.warning("No recipient email — skipping send.")
        return False

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = cfg["SMTP_USERNAME"]
    msg["To"] = to_addr

    try:
        with smtplib.SMTP(cfg["SMTP_HOST"], cfg["SMTP_PORT"]) as server:
            server.starttls()
            server.login(cfg["SMTP_USERNAME"], cfg["SMTP_PASSWORD"])
            server.send_message(msg)
        return True
    except Exception as e:
        app.logger.error(f"Failed to send email to {to_addr}: {e}")
        return False
