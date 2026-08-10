from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from extensions import db
from models import CodeSnippet

bp = Blueprint("codes", __name__)


@bp.route("/codes")
@login_required
def index():
    snippets = (
        CodeSnippet.query.filter_by(user_id=current_user.id)
        .order_by(CodeSnippet.updated_at.desc())
        .all()
    )
    return render_template("codes.html", snippets=snippets)


@bp.route("/codes/create", methods=["POST"])
@login_required
def create():
    title = request.form.get("title", "").strip()
    code = request.form.get("code", "").strip()
    language = request.form.get("language", "python").strip()

    if not title:
        flash("Title is required.", "error")
        return redirect(url_for("codes.index"))

    snippet = CodeSnippet(
        title=title,
        code=code,
        language=language,
        user_id=current_user.id,
    )
    db.session.add(snippet)
    db.session.commit()
    flash("Code snippet created!", "success")
    return redirect(url_for("codes.index"))


@bp.route("/codes/<snippet_id>/update", methods=["POST"])
@login_required
def update(snippet_id):
    snippet = CodeSnippet.query.get_or_404(snippet_id)
    if snippet.user_id != current_user.id:
        return redirect(url_for("codes.index"))

    snippet.title = request.form.get("title", snippet.title).strip() or snippet.title
    snippet.code = request.form.get("code", snippet.code)
    snippet.language = request.form.get("language", snippet.language).strip() or snippet.language
    db.session.commit()
    flash("Code snippet updated!", "success")
    return redirect(url_for("codes.index"))


@bp.route("/codes/<snippet_id>/delete", methods=["POST"])
@login_required
def delete(snippet_id):
    snippet = CodeSnippet.query.get_or_404(snippet_id)
    if snippet.user_id != current_user.id:
        return redirect(url_for("codes.index"))

    db.session.delete(snippet)
    db.session.commit()
    flash("Code snippet deleted.", "success")
    return redirect(url_for("codes.index"))
