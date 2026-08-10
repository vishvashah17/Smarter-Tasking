from flask import Blueprint, render_template, request
from flask_login import login_required, current_user

from models import Task

bp = Blueprint("history", __name__)


@bp.route("/history")
@login_required
def index():
    type_filter = request.args.get("type")  # 'daily' | 'periodic' | None
    status_filter = request.args.get("status")  # 'completed' | 'missed' | None

    query = Task.query.filter(
        Task.user_id == current_user.id,
        Task.status.in_(["completed", "missed"]),
    )
    if type_filter in ("daily", "periodic"):
        query = query.filter_by(type=type_filter)
    if status_filter in ("completed", "missed"):
        query = query.filter_by(status=status_filter)

    tasks = query.order_by(Task.updated_at.desc()).all()
    daily_tasks = [t for t in tasks if t.type == "daily"]
    periodic_tasks = [t for t in tasks if t.type == "periodic"]
    return render_template(
        "history.html",
        tasks=tasks,
        daily_tasks=daily_tasks,
        periodic_tasks=periodic_tasks,
        type_filter=type_filter,
        status_filter=status_filter,
    )
