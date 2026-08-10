from flask import Flask

from config import Config
from extensions import db, login_manager


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)

    from auth import bp as auth_bp
    from routes.daily import bp as daily_bp
    from routes.periodic import bp as periodic_bp
    from routes.history import bp as history_bp
    from routes.trigger import bp as trigger_bp
    from routes.codes import bp as codes_bp
    from routes.profile import bp as profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(daily_bp)
    app.register_blueprint(periodic_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(trigger_bp)
    app.register_blueprint(codes_bp)
    app.register_blueprint(profile_bp)

    with app.app_context():
        db.create_all()

    if app.config["ENABLE_INPROCESS_SCHEDULER"]:
        _start_inprocess_scheduler(app)

    return app


def _start_inprocess_scheduler(app):
    """Optional: only useful on an always-on host. On free-tier hosts that
    sleep when idle, use the external trigger-endpoint approach instead
    (see README)."""
    from apscheduler.schedulers.background import BackgroundScheduler
    from scheduler import run_daily_reminder_check

    sched = BackgroundScheduler()
    sched.add_job(
        lambda: run_daily_reminder_check(app),
        "cron",
        hour=app.config["REMINDER_HOUR"],
        minute=app.config["REMINDER_MINUTE"],
    )
    sched.start()


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
