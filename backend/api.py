from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user

from extensions import db
from models import CodeSnippet, Note, Task, User

bp = Blueprint("api", __name__)


@bp.route("/<path:_path>", methods=["OPTIONS"])
@bp.route("/", methods=["OPTIONS"])
def options(_path=None):
    return ("", 204)


def json_data():
    return request.get_json(silent=True) or {}


def error(message, status=400):
    return jsonify({"error": message}), status


def dt(value):
    return value.isoformat() if value else None


def client_tz_offset():
    try:
        return int(request.headers.get("X-Timezone-Offset", "0"))
    except ValueError:
        return 0


def client_local_now():
    return datetime.utcnow() - timedelta(minutes=client_tz_offset())


def utc_to_client_local(value):
    return value - timedelta(minutes=client_tz_offset())


def rollover_missed_tasks():
    """Move overdue active tasks into history as missed for the current user."""
    if not current_user.is_authenticated:
        return 0

    now_local = client_local_now()
    active_tasks = Task.query.filter_by(user_id=current_user.id, status="active").all()
    changed = 0

    for task in active_tasks:
        is_missed = False
        if task.type == "daily":
            is_missed = utc_to_client_local(task.created_at).date() < now_local.date()
        elif task.type == "periodic" and task.deadline:
            is_missed = task.deadline < now_local

        if is_missed:
            task.status = "missed"
            task.completed_at = None
            changed += 1

    if changed:
        db.session.commit()
    return changed


def parse_deadline(value):
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized).replace(tzinfo=None)
    except ValueError:
        return datetime.strptime(value, "%Y-%m-%dT%H:%M")


def user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "created_at": dt(user.created_at),
    }


def task_payload(task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description or "",
        "type": task.type,
        "status": task.status,
        "deadline": dt(task.deadline),
        "recurrence": task.recurrence,
        "created_at": dt(task.created_at),
        "updated_at": dt(task.updated_at),
        "completed_at": dt(task.completed_at),
    }


def note_payload(note):
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content or "",
        "created_at": dt(note.created_at),
        "updated_at": dt(note.updated_at),
    }


def code_payload(snippet):
    return {
        "id": snippet.id,
        "title": snippet.title,
        "code": snippet.code or "",
        "language": snippet.language or "python",
        "created_at": dt(snippet.created_at),
        "updated_at": dt(snippet.updated_at),
    }


def owned_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return None
    return task


def owned_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        return None
    return note


def owned_code(snippet_id):
    snippet = CodeSnippet.query.get_or_404(snippet_id)
    if snippet.user_id != current_user.id:
        return None
    return snippet


@bp.route("/auth/me")
def me():
    if not current_user.is_authenticated:
        return jsonify({"user": None}), 401
    return jsonify({"user": user_payload(current_user)})


@bp.route("/auth/signup", methods=["POST"])
def signup():
    data = json_data()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    confirm = data.get("confirm_password", "")

    if not username:
        return error("Username is required.")
    if len(password) < 6:
        return error("Password must be at least 6 characters.")
    if password != confirm:
        return error("Passwords do not match.")
    if User.query.filter_by(username=username).first():
        return error("Username is already taken.", 409)

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return jsonify({"user": user_payload(user)}), 201


@bp.route("/auth/login", methods=["POST"])
def login():
    data = json_data()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return error("Invalid username or password.", 401)

    login_user(user)
    return jsonify({"user": user_payload(user)})


@bp.route("/auth/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"ok": True})


@bp.route("/tasks")
@login_required
def list_tasks():
    rollover_missed_tasks()
    task_type = request.args.get("type")
    status = request.args.get("status", "active")
    query = Task.query.filter_by(user_id=current_user.id)
    if task_type in ("daily", "periodic"):
        query = query.filter_by(type=task_type)
    if status in ("active", "completed", "missed"):
        query = query.filter_by(status=status)
    if task_type == "periodic":
        query = query.order_by(Task.deadline.asc())
    else:
        query = query.order_by(Task.created_at.desc())
    return jsonify({"tasks": [task_payload(task) for task in query.all()]})


@bp.route("/tasks", methods=["POST"])
@login_required
def create_task():
    data = json_data()
    title = data.get("title", "").strip()
    task_type = data.get("type", "daily")

    if not title:
        return error("Title is required.")
    if task_type not in ("daily", "periodic"):
        return error("Task type must be daily or periodic.")

    deadline = parse_deadline(data.get("deadline")) if task_type == "periodic" else None
    if task_type == "periodic" and not deadline:
        return error("Deadline is required for periodic tasks.")

    task = Task(
        title=title,
        description=data.get("description", "").strip(),
        type=task_type,
        status="active",
        deadline=deadline,
        recurrence=data.get("recurrence", "none") if task_type == "periodic" else None,
        user_id=current_user.id,
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"task": task_payload(task)}), 201


@bp.route("/tasks/<task_id>", methods=["PATCH"])
@login_required
def update_task(task_id):
    rollover_missed_tasks()
    task = owned_task(task_id)
    if not task:
        return error("Task not found.", 404)

    data = json_data()
    if "title" in data:
        task.title = data.get("title", "").strip() or task.title
    if "description" in data:
        task.description = data.get("description", "")
    if task.type == "periodic" and "deadline" in data:
        task.deadline = parse_deadline(data.get("deadline"))
    db.session.commit()
    return jsonify({"task": task_payload(task)})


@bp.route("/tasks/<task_id>/complete", methods=["POST"])
@login_required
def complete_task(task_id):
    rollover_missed_tasks()
    task = owned_task(task_id)
    if not task:
        return error("Task not found.", 404)
    if task.status != "active":
        return error("Only active tasks can be completed.", 400)
    task.status = "completed"
    task.completed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"task": task_payload(task)})


@bp.route("/tasks/<task_id>", methods=["DELETE"])
@login_required
def delete_task(task_id):
    task = owned_task(task_id)
    if not task:
        return error("Task not found.", 404)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"ok": True})


@bp.route("/history")
@login_required
def history():
    rollover_missed_tasks()
    type_filter = request.args.get("type")
    status_filter = request.args.get("status")
    query = Task.query.filter(
        Task.user_id == current_user.id,
        Task.status.in_(["completed", "missed"]),
    )
    if type_filter in ("daily", "periodic"):
        query = query.filter_by(type=type_filter)
    if status_filter in ("completed", "missed"):
        query = query.filter_by(status=status_filter)
    tasks = query.order_by(Task.updated_at.desc()).all()
    return jsonify({"tasks": [task_payload(task) for task in tasks]})


@bp.route("/notes")
@login_required
def list_notes():
    notes = (
        Note.query.filter_by(user_id=current_user.id)
        .order_by(Note.updated_at.desc())
        .all()
    )
    return jsonify({"notes": [note_payload(note) for note in notes]})


@bp.route("/notes", methods=["POST"])
@login_required
def create_note():
    data = json_data()
    title = data.get("title", "").strip()
    if not title:
        return error("Title is required.")
    note = Note(title=title, content=data.get("content", ""), user_id=current_user.id)
    db.session.add(note)
    db.session.commit()
    return jsonify({"note": note_payload(note)}), 201


@bp.route("/notes/<note_id>", methods=["PATCH"])
@login_required
def update_note(note_id):
    note = owned_note(note_id)
    if not note:
        return error("Note not found.", 404)
    data = json_data()
    note.title = data.get("title", note.title).strip() or note.title
    note.content = data.get("content", note.content)
    db.session.commit()
    return jsonify({"note": note_payload(note)})


@bp.route("/notes/<note_id>", methods=["DELETE"])
@login_required
def delete_note(note_id):
    note = owned_note(note_id)
    if not note:
        return error("Note not found.", 404)
    db.session.delete(note)
    db.session.commit()
    return jsonify({"ok": True})


@bp.route("/codes")
@login_required
def list_codes():
    snippets = (
        CodeSnippet.query.filter_by(user_id=current_user.id)
        .order_by(CodeSnippet.updated_at.desc())
        .all()
    )
    return jsonify({"snippets": [code_payload(snippet) for snippet in snippets]})


@bp.route("/codes", methods=["POST"])
@login_required
def create_code():
    data = json_data()
    title = data.get("title", "").strip()
    if not title:
        return error("Title is required.")
    snippet = CodeSnippet(
        title=title,
        code=data.get("code", ""),
        language=data.get("language", "python").strip() or "python",
        user_id=current_user.id,
    )
    db.session.add(snippet)
    db.session.commit()
    return jsonify({"snippet": code_payload(snippet)}), 201


@bp.route("/codes/<snippet_id>", methods=["PATCH"])
@login_required
def update_code(snippet_id):
    snippet = owned_code(snippet_id)
    if not snippet:
        return error("Code snippet not found.", 404)
    data = json_data()
    snippet.title = data.get("title", snippet.title).strip() or snippet.title
    snippet.code = data.get("code", snippet.code)
    snippet.language = data.get("language", snippet.language).strip() or snippet.language
    db.session.commit()
    return jsonify({"snippet": code_payload(snippet)})


@bp.route("/codes/<snippet_id>", methods=["DELETE"])
@login_required
def delete_code(snippet_id):
    snippet = owned_code(snippet_id)
    if not snippet:
        return error("Code snippet not found.", 404)
    db.session.delete(snippet)
    db.session.commit()
    return jsonify({"ok": True})


@bp.route("/profile")
@login_required
def profile():
    rollover_missed_tasks()
    stats = {
        "total_tasks": Task.query.filter_by(user_id=current_user.id).count(),
        "active_tasks": Task.query.filter_by(user_id=current_user.id, status="active").count(),
        "completed_tasks": Task.query.filter_by(user_id=current_user.id, status="completed").count(),
        "code_snippets": CodeSnippet.query.filter_by(user_id=current_user.id).count(),
        "notes": Note.query.filter_by(user_id=current_user.id).count(),
    }
    return jsonify({"user": user_payload(current_user), "stats": stats})


@bp.route("/profile/change-password", methods=["POST"])
@login_required
def change_password():
    data = json_data()
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not current_user.check_password(current_password):
        return error("Current password is incorrect.", 400)
    if len(new_password) < 6:
        return error("New password must be at least 6 characters.")
    if new_password != confirm_password:
        return error("New passwords do not match.")

    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({"ok": True})
