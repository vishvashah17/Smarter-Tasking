from flask import Blueprint, request, abort, current_app, jsonify

from scheduler import run_daily_reminder_check

bp = Blueprint("trigger", __name__)


@bp.route("/api/trigger-reminder", methods=["GET", "POST"])
def trigger_reminder():
    """
    Not tied to a logged-in browser session on purpose — an external cron
    service calls this once a day. Protected by a shared-secret token instead.
    """
    token = request.args.get("token") or request.headers.get("X-Reminder-Token")
    if not token or token != current_app.config["REMINDER_TRIGGER_TOKEN"]:
        abort(403)

    count = run_daily_reminder_check(current_app)
    return jsonify({"status": "ok", "tasks_included_in_reminder": count})
