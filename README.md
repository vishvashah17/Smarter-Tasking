# Task Manager

This project is split into a Flask JSON API backend and a React frontend.
The backend lives in `backend/` and serves `/api/*` on port `5000`; the
frontend is a Vite app in `frontend/` on port `5173`.

## What's included

- User login/signup with Flask-Login session cookies
- Daily tasks: create, complete, delete
- Periodic tasks: create, complete, delete, with optional deadline
- History: read-only filtered view over completed/missed tasks
- Code snippets and notes
- Profile and password change

## Run it locally

Backend:

```sh
cd taskmanager
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/app.py
```

Frontend:

```sh
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Flask at
`http://127.0.0.1:5000`, so the UI and backend run on separate ports during
development.

For non-proxied frontend deployments, set `FRONTEND_ORIGINS` on the backend:

```sh
FRONTEND_ORIGINS=https://your-frontend.example
```

## Deploy on Vercel

This repo is configured as one Vercel project:

- React is built from `frontend/`
- Static output is served from `frontend/dist`
- `/api/*` requests are rewritten to `backend/app.py`

In Vercel Project Settings, keep the project Root Directory as the repository
root and use the repo's `vercel.json`. Add the same backend environment
variables you used before, especially:

- `SECRET_KEY`
- `DATABASE_URL`
- `FRONTEND_ORIGINS=https://your-vercel-domain.vercel.app`

Then redeploy from Vercel or run:

```sh
vercel --prod
```
