from datetime import datetime

from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_required, current_user

from extensions import db
from models import Task

bp = Blueprint("daily", __name__)


@bp.route("/")
@login_required
def index():
    tasks = (
        Task.query.filter_by(user_id=current_user.id, type="daily", status="active")
        .order_by(Task.created_at.desc())
        .all()
    )
    return render_template("daily.html", tasks=tasks)


@bp.route("/daily/create", methods=["POST"])
@login_required
def create():
    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    if title:
        db.session.add(Task(title=title, description=description, type="daily", status="active", user_id=current_user.id))
        db.session.commit()
    return redirect(url_for("daily.index"))


@bp.route("/daily/<task_id>/update", methods=["POST"])
@login_required
def update(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return redirect(url_for("daily.index"))
    task.title = request.form.get("title", task.title).strip() or task.title
    task.description = request.form.get("description", task.description)
    db.session.commit()
    return redirect(url_for("daily.index"))


@bp.route("/daily/<task_id>/complete", methods=["POST"])
@login_required
def complete(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return redirect(url_for("daily.index"))
    task.status = "completed"
    task.completed_at = datetime.utcnow()
    db.session.commit()
    return redirect(url_for("daily.index"))


@bp.route("/daily/<task_id>/delete", methods=["POST"])
@login_required
def delete(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return redirect(url_for("daily.index"))
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for("daily.index"))
