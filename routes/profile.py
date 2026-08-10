from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from flask_login import login_required, current_user

from extensions import db
from models import Task, CodeSnippet

bp = Blueprint("profile", __name__)


@bp.route("/profile")
@login_required
def index():
    stats = {
        "total_tasks": Task.query.filter_by(user_id=current_user.id).count(),
        "active_tasks": Task.query.filter_by(user_id=current_user.id, status="active").count(),
        "completed_tasks": Task.query.filter_by(user_id=current_user.id, status="completed").count(),
        "code_snippets": CodeSnippet.query.filter_by(user_id=current_user.id).count(),
    }

    # The reminder email is the user's own email
    reminder_email = current_user.email

    return render_template("profile.html", stats=stats, reminder_email=reminder_email)


@bp.route("/profile/change-password", methods=["POST"])
@login_required
def change_password():
    current_password = request.form.get("current_password", "")
    new_password = request.form.get("new_password", "")
    confirm_password = request.form.get("confirm_password", "")

    if not current_user.check_password(current_password):
        flash("Current password is incorrect.", "error")
        return redirect(url_for("profile.index"))

    if len(new_password) < 6:
        flash("New password must be at least 6 characters.", "error")
        return redirect(url_for("profile.index"))

    if new_password != confirm_password:
        flash("New passwords do not match.", "error")
        return redirect(url_for("profile.index"))

    current_user.set_password(new_password)
    db.session.commit()
    flash("Password changed successfully!", "success")
    return redirect(url_for("profile.index"))


@bp.route("/profile/update-email", methods=["POST"])
@login_required
def update_email():
    new_email = request.form.get("reminder_email", "").strip().lower()

    if not new_email:
        flash("Email cannot be empty.", "error")
        return redirect(url_for("profile.index"))

    # Check if email is already taken by another user
    from models import User
    existing = User.query.filter(User.email == new_email, User.id != current_user.id).first()
    if existing:
        flash("That email is already registered to another account.", "error")
        return redirect(url_for("profile.index"))

    current_user.email = new_email
    db.session.commit()
    flash("Reminder email updated successfully!", "success")
    return redirect(url_for("profile.index"))
