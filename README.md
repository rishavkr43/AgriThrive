# AgriThrive

AgriThrive is a full-stack agricultural assistant platform that provides market prices, AI-powered price predictions, crop diagnosis, legal templates and advice, scheme navigation, and a chatbot assistant. The repository contains a Node/Express backend and a React + Vite frontend (with Supabase for auth and storage).

Live demo
---------
- Frontend (live): https://agri-thrive.vercel.app/
- Backend (deployed): https://agrithrive.onrender.com/

Repository layout
-----------------
- `backend/` - Node/Express backend, API routes, AI integrations.
- `frontend/` - Vite + React + TypeScript frontend (uses Supabase for auth & session).
- `.gitignore` - repo ignore rules

Main features
-------------
- Market prices and comparison across markets
- 7/15/30-day AI price predictions
- Crop diagnosis page (image upload + basic AI diagnostics)
- Legal templates and document analysis
- Scheme navigator with filters & saved schemes
- Chatbot assistant (AI-powered)
- User profile management (uses Supabase auth/session)



🔧 Data Authenticity:
 Government Schemes and Market Prices are fetched directly from official datasets on https://www.data.gov.in/
 via API integration — ensuring real, reliable, up-to-date information (not AI-generated).

Tech stack
----------
- Frontend: React + TypeScript, Vite, Tailwind CSS, Recharts
- Backend: Node.js + Express
- Authentication & storage: Supabase
- AI integrations: Google Generative AI/other services (back-end)

Prerequisites
-------------
- Node.js (v18+ recommended)
- npm (or Yarn/pnpm) installed
- (Optional) Supabase project if running features that require auth/storage

Environment variables
---------------------
Create `.env` files in the `frontend/` and `backend/` directories (not committed). Example values used by this repo:

Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=https://<your-supabase>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_URL=https://agrithrive.onrender.com
```

Backend (`backend/.env`)
```
PORT=5000
SUPABASE_URL=https://<your-supabase>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
GEMINI_API_KEY=<google-gemini-key>
# other secrets used by routes (DB, S3, etc.)
```

Important: Do not commit `.env` files. If secrets were accidentally committed, rotate them immediately and remove from git history.

Run locally (Windows PowerShell)
-------------------------------
Follow these steps to run backend and frontend locally.

1) Backend

```powershell
cd backend
npm install
# create backend/.env with required variables (see above)
npm run dev
```

By default the backend listens on `PORT` (5000). The API routes are mounted under `/api` (for example: `http://localhost:5000/api/schemes`). When running against the deployed backend, the frontend uses `VITE_API_URL`.

2) Frontend

```powershell
cd frontend
npm install
# create frontend/.env with required variables (see above)
npm run dev
```

This starts Vite dev server (default port may be 5173 or as configured). The frontend uses `import.meta.env.VITE_API_URL` to call the backend. By default in this repo `VITE_API_URL` is set to `https://agrithrive.onrender.com` to point to the deployed backend.


