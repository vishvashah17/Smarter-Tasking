import uuid
from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db


def gen_id():
    return str(uuid.uuid4())


class User(UserMixin, db.Model):
    """Multi-user support — each user has their own tasks and code snippets."""

    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    tasks = db.relationship("Task", backref="owner", lazy="dynamic", cascade="all, delete-orphan")
    code_snippets = db.relationship("CodeSnippet", backref="owner", lazy="dynamic", cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="owner", lazy="dynamic", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username!r}>"


class Task(db.Model):
    """
    A single model backs all three pages:
      - type='daily'    -> Daily Tasks page (no deadline/recurrence)
      - type='periodic'  -> Periodic Tasks page (has deadline + recurrence)
    History is a filtered *view* over this table (status='completed' or 'missed'),
    not a separate table, so there's nothing to keep in sync.
    """

    __tablename__ = "tasks"

    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    type = db.Column(db.String(10), nullable=False)  # 'daily' | 'periodic'
    status = db.Column(db.String(10), nullable=False, default="active")  # active | completed | missed

    # Periodic-only fields
    deadline = db.Column(db.DateTime, nullable=True)
    recurrence = db.Column(db.String(10), nullable=True)  # none | daily | weekly | monthly | custom

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"<Task {self.id} {self.title!r} ({self.type}/{self.status})>"


class CodeSnippet(db.Model):
    """Stores code snippets created by the user."""

    __tablename__ = "code_snippets"

    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    code = db.Column(db.Text, nullable=False, default="")
    language = db.Column(db.String(40), nullable=True, default="python")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<CodeSnippet {self.id} {self.title!r}>"


class Note(db.Model):
    """Stores text notes created by the user."""

    __tablename__ = "notes"

    id = db.Column(db.String(36), primary_key=True, default=gen_id)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False, default="")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Note {self.id} {self.title!r}>"
