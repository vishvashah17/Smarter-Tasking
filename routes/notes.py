from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from extensions import db
from models import Note

bp = Blueprint("notes", __name__)


@bp.route("/notes")
@login_required
def index():
    notes = (
        Note.query.filter_by(user_id=current_user.id)
        .order_by(Note.updated_at.desc())
        .all()
    )
    return render_template("notes.html", notes=notes)


@bp.route("/notes/create", methods=["POST"])
@login_required
def create():
    title = request.form.get("title", "").strip()
    content = request.form.get("content", "").strip()

    if not title:
        flash("Title is required.", "error")
        return redirect(url_for("notes.index"))

    note = Note(title=title, content=content, user_id=current_user.id)
    db.session.add(note)
    db.session.commit()
    flash("Note created!", "success")
    return redirect(url_for("notes.index"))


@bp.route("/notes/<note_id>/update", methods=["POST"])
@login_required
def update(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        return redirect(url_for("notes.index"))

    note.title = request.form.get("title", note.title).strip() or note.title
    note.content = request.form.get("content", note.content)
    db.session.commit()
    flash("Note updated!", "success")
    return redirect(url_for("notes.index"))


@bp.route("/notes/<note_id>/delete", methods=["POST"])
@login_required
def delete(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        return redirect(url_for("notes.index"))

    db.session.delete(note)
    db.session.commit()
    flash("Note deleted.", "success")
    return redirect(url_for("notes.index"))
