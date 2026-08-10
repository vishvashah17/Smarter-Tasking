from datetime import datetime

from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_required, current_user

from extensions import db
from models import Task

bp = Blueprint("periodic", __name__)


@bp.route("/periodic")
@login_required
def index():
    tasks = (
        Task.query.filter_by(user_id=current_user.id, type="periodic", status="active")
        .order_by(Task.deadline.asc())
        .all()
    )
    return render_template("periodic.html", tasks=tasks)


def _parse_deadline(value):
    if not value:
        return None
    # HTML datetime-local input format: "YYYY-MM-DDTHH:MM"
    return datetime.strptime(value, "%Y-%m-%dT%H:%M")


@bp.route("/periodic/create", methods=["POST"])
@login_required
def create():
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    deadline = _parse_deadline(request.form.get("deadline"))

    if title:
        task = Task(
            title=title,
            description=description,
            type="periodic",
            status="active",
            deadline=deadline,
            recurrence="none",
            recurrence_interval_days=None,
            user_id=current_user.id,
        )
        db.session.add(task)
        db.session.commit()
        
    return redirect(url_for("periodic.index"))


@bp.route("/periodic/<task_id>/update", methods=["POST"])
@login_required
def update(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return redirect(url_for("periodic.index"))
    task.title = request.form.get("title", task.title).strip() or task.title
    task.description = request.form.get("description", task.description)
    deadline = request.form.get("deadline")
    if deadline:
        task.deadline = _parse_deadline(deadline)
    task.recurrence = "none"
    task.recurrence_interval_days = None
    db.session.commit()
    return redirect(url_for("periodic.index"))


@bp.route("/periodic/<task_id>/complete", methods=["POST"])
@login_required
def complete(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return redirect(url_for("periodic.index"))

    task.status = "completed"
    task.completed_at = datetime.utcnow()

    db.session.commit()
    return redirect(url_for("periodic.index"))


@bp.route("/periodic/<task_id>/delete", methods=["POST"])
@login_required
def delete(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return redirect(url_for("periodic.index"))
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for("periodic.index"))
