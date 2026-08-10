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
    from routes.codes import bp as codes_bp
    from routes.notes import bp as notes_bp
    from routes.profile import bp as profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(daily_bp)
    app.register_blueprint(periodic_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(codes_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(profile_bp)

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
