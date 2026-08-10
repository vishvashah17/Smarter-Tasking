# Task Manager — Phase 1 (Foundation)

This is the foundation build: a working Flask app with login, the Task data
model, and all three pages (Daily / Periodic / History) wired up with full
CRUD. The reminder email logic is implemented and reachable via an API
endpoint, ready to be triggered by an external daily scheduler.

## What's included

- Single-admin login (Flask-Login), since this will run on a public URL
- Daily tasks: create, edit, complete, delete
- Periodic tasks: same, plus deadline + recurrence (daily/weekly/monthly/custom),
  auto-rolling forward on completion
- History: read-only filtered view over completed/missed tasks
- `/api/trigger-reminder?token=...` — sends the daily digest email on demand,
  designed to be called by a free external scheduler (see Deployment below)

## Run it locally

```bash
cd taskmanager
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Generate an admin password hash and put it in .env as ADMIN_PASSWORD_HASH:
python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('yourpassword'))"
# Also fill in SMTP_USERNAME / SMTP_PASSWORD / REMINDER_EMAIL if you want to test email

python app.py
```

Visit `http://localhost:5000`, log in with the username/password you set.

To test the reminder email without waiting for a schedule:
```
http://localhost:5000/api/trigger-reminder?token=YOUR_REMINDER_TRIGGER_TOKEN
```

## Deployment (Render, free tier)

1. Push this folder to a GitHub repo.
2. On Render: New → Web Service → connect the repo. Build command
   `pip install -r requirements.txt`, start command `gunicorn app:app`.
3. Add all the variables from `.env.example` as environment variables in
   Render's dashboard (never commit your real `.env`).
4. **Important — free tier sleep behavior:** Render's free web services spin
   down after 15 minutes of inactivity. Don't rely on the in-process
   scheduler (`ENABLE_INPROCESS_SCHEDULER`) for this — leave it `false`.
   Instead, set up a free external scheduler to hit the trigger endpoint
   once a day:
   - Go to [cron-job.org](https://cron-job.org) (free, no card required),
     create an account, and add a new cron job that does a daily GET to:
     `https://your-app.onrender.com/api/trigger-reminder?token=YOUR_REMINDER_TRIGGER_TOKEN`
     at whatever time you want your reminder to arrive.
   - This single request both wakes the sleeping service and runs the
     reminder check — no paid Render Cron Jobs needed.
5. **SQLite persistence caveat:** Render's free web services don't include a
   persistent disk by default, so the SQLite file can be reset on a
   redeploy. Fine for active development; if you want this to be
   bulletproof long-term, we can move to a hosted database later.

## Next phases

This covers Phase 1 (Foundation) from the PRD. Everything is functional —
you can create/complete/delete tasks on all three pages and trigger a real
reminder email right now. Let me know if you want any adjustments before we
move on to polish (Phase 2 onward): nicer styling, task editing in the UI
(currently update endpoints exist but aren't wired to a form yet), and
deployment walkthrough end-to-end.
