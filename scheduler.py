from datetime import datetime, timedelta, date

from extensions import db
from models import Task, User
from email_utils import send_reminder_email
from utils import format_recurrence, recurrence_interval_days


def _should_send_periodic_reminder(task, today, window_end):
    deadline_date = task.deadline.date()

    if deadline_date < today:
        interval_days = recurrence_interval_days(task.recurrence, task.recurrence_interval_days)
        if interval_days is None:
            return task.last_reminded_date != today
        if task.last_reminded_date is None:
            return True
        return (today - task.last_reminded_date).days >= interval_days

    if deadline_date == today:
        return task.last_reminded_date != today

    if deadline_date <= window_end:
        return task.last_reminded_date is None

    return False


def run_daily_reminder_check(app):
    """
    Scans ALL users' active periodic tasks and sends ONE digest email
    per user covering:
      - overdue tasks (deadline has passed, still active)
      - due today
      - due within REMINDER_WINDOW_DAYS

    Idempotent: won't re-send for a task already reminded today
    (tracked via Task.last_reminded_date), so it's safe to call this
    endpoint more than once on the same day.

    Returns the total number of tasks included across all emails sent.
    """
    with app.app_context():
        today = date.today()
        window_end = today + timedelta(days=app.config["REMINDER_WINDOW_DAYS"])

        users = User.query.all()
        total_count = 0

        for user in users:
            if not user.email:
                continue

            candidates = (
                Task.query.filter(
                    Task.user_id == user.id,
                    Task.type == "periodic",
                    Task.status == "active",
                    Task.deadline.isnot(None),
                )
                .all()
            )

            overdue, due_today, due_soon = [], [], []
            for task in candidates:
                if not _should_send_periodic_reminder(task, today, window_end):
                    continue

                deadline_date = task.deadline.date()
                if deadline_date < today:
                    overdue.append(task)
                elif deadline_date == today:
                    due_today.append(task)
                elif deadline_date <= window_end:
                    due_soon.append(task)

            relevant = overdue + due_today + due_soon
            if not relevant:
                continue

            lines = [f"Hi {user.username},\n"]
            if overdue:
                lines.append("OVERDUE:")
                lines += [
                    f"  - {t.title} (was due {t.deadline.strftime('%Y-%m-%d')}; repeats {format_recurrence(t.recurrence, t.recurrence_interval_days)})"
                    for t in overdue
                ]
            if due_today:
                lines.append("\nDUE TODAY:")
                lines += [
                    f"  - {t.title} (repeats {format_recurrence(t.recurrence, t.recurrence_interval_days)})"
                    for t in due_today
                ]
            if due_soon:
                lines.append("\nCOMING UP:")
                lines += [
                    f"  - {t.title} (due {t.deadline.strftime('%Y-%m-%d')}; repeats {format_recurrence(t.recurrence, t.recurrence_interval_days)})"
                    for t in due_soon
                ]

            body = "\n".join(lines)
            subject = f"Task reminders — {len(relevant)} item(s) need attention"

            sent = send_reminder_email(app, subject, body, recipient=user.email)
            if sent:
                for task in relevant:
                    task.last_reminded_date = today
                total_count += len(relevant)

        if total_count:
            db.session.commit()

        return total_count
