# ClassRank

A simple classroom web app where students privately rank their classmates from **1 to n** and leave an optional comment on each person. Teachers create a class, share a code, and unlock results with a PIN.

## Features

- **Create a class** with a roster (one name per line) and a teacher PIN
- **Students join** with the class code, pick their name, then drag classmates into ranked order
- **Comments** on each classmate before submitting
- **Teacher results** show average ranks, SD and other stats, who-said-what comments, and individual submissions (PIN-protected)
- **Download results** exports a CSV with statistics, peer comments, and full submissions

Data is stored in **Turso** (hosted SQLite) when `TURSO_DATABASE_URL` is set. Locally, without those env vars, it uses a SQLite file at `data/classrank.db`.

## Run locally

```bash
npm install
npm run dev -- --port 43123
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Optional: copy `.env.example` to `.env.local` and add Turso credentials to use the same cloud DB locally.

## GitHub + Render + Turso (persistent data)

### 1. Put the code on GitHub

1. Create a GitHub account/repo if you don’t have one (or use **Create repo** in Cursor).
2. Push this project to GitHub on the `main` branch.
3. Confirm you can see the files on github.com (including `package.json` and `render.yaml`).

Render deploys **from GitHub**, not from your laptop alone.

### 2. Create a free Turso database

1. Sign up at [https://turso.tech](https://turso.tech).
2. Create a database (any name, e.g. `classrank`).
3. Create a token for that database.
4. Copy:
   - **Database URL** (`libsql://...`) → `TURSO_DATABASE_URL`
   - **Auth token** → `TURSO_AUTH_TOKEN`

### 3. Deploy on Render

1. In Render: **New → Web Service** → connect your **GitHub** repo.
2. Settings:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Plan:** Free
3. Under **Environment**, add:
   - `TURSO_DATABASE_URL` = your Turso URL
   - `TURSO_AUTH_TOKEN` = your Turso token
4. Deploy. Open the `*.onrender.com` URL.

With Turso set, class data **survives** Render sleep and redeploys.

### Free Render note

The website may still **sleep when idle** (first visit can take ~30–60s). Sleep does **not** delete Turso data.

## Typical flow

1. Teacher opens **Create a class**, enters the roster and a 4–8 digit PIN, and copies the class code.
2. Students open **Student join**, enter the code, select their name, rank classmates, add comments, and submit.
3. Teacher opens **Teacher login** from the home page or header, enters the class code and PIN, and reviews averages and comments.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
