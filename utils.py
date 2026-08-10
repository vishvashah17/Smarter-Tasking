from datetime import timedelta


def compute_next_deadline(current_deadline, recurrence, interval_days=None):
    """Given a periodic task's current deadline and recurrence rule, return the
    next deadline, or None if the task doesn't recur."""
    if current_deadline is None:
        return None

    if recurrence == "daily":
        return current_deadline + timedelta(days=1)

    if recurrence == "weekly":
        return current_deadline + timedelta(weeks=1)

    if recurrence == "monthly":
        month = current_deadline.month + 1
        year = current_deadline.year
        if month > 12:
            month = 1
            year += 1
        # Clamp the day to keep things simple and avoid invalid dates like Feb 30
        day = min(current_deadline.day, 28)
        return current_deadline.replace(year=year, month=month, day=day)

    if recurrence == "custom" and interval_days:
        return current_deadline + timedelta(days=interval_days)

    return None  # recurrence == 'none' or unrecognized
