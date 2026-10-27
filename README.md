# Hospital MIS System

A MERN hospital management system with three parts:

| Folder | What it is | Local URL |
|---|---|---|
| `backend/` | Express + MongoDB REST API | http://localhost:4000 |
| `frontend/` | Patient website and medical store (no patient accounts) | http://localhost:5173 |
| `dashboard/` | Hospital staff portal: Admin and Doctor logins | http://localhost:5174 |

## How the hospital uses it

1. **Patient** books an appointment on the website. No account needed. The consultation fee (₹500 by default, same for every doctor) is shown and paid at the hospital.
2. **Admin** (dashboard → login as Admin) accepts or rejects the request.
3. When the patient arrives, the admin clicks **Mark arrived** (check-in time is recorded).
4. **Doctor** (dashboard → login as Doctor) sees their own patients. **Mark consultation done** opens the consultation page: notes, medicines dispensed from the hospital store, and payment for fee + medicines (Cash/UPI/Card), or "patient pays at reception".
5. If the patient pays at reception, the admin clicks **Generate receipt**. Either way the printable receipt (`MT-<year>-<number>`) lists the fee, each medicine and the doctor's notes.

**One admin account.** There is exactly one admin, created once from the command line. The same login can be used on several PCs at the same time; each login lasts `ADMIN_SESSION_HOURS` (8 by default) and then asks to log in again. Every open dashboard **updates live**: when one person accepts an appointment, adds a doctor or a sale happens, the other screens change without refreshing (a green **● Live** badge shows the connection).

**Doctors** are added by the admin (login ID = email + a password to hand over) and can change their password under *Change Password*. Removing a doctor cancels their open appointments; visited/paid ones are kept.

**Medicine store.** The website's store sells from the same inventory doctors prescribe from. The admin's **Medicine Store** page shows stock and units sold per medicine (with "Add stock"), and an Excel-style sheet of every sale (online orders and prescriptions) with buyer details, downloadable as CSV. Online orders are cash on delivery; the admin marks them paid.

**Appointment times.** Patients pick a 30-minute slot within hospital hours (Mon–Fri 9 AM–7 PM, Sat 9 AM–5 PM, closed Sunday); a doctor can't be double-booked. Lists show each day as a queue: patients still to be handled first by time, finished visits (paid/rejected; for doctors, consultation done) below.

Settings in `backend/config/.env`: `CONSULTATION_FEE`, `ADMIN_SESSION_HOURS`, `TZ` (hospital time zone, `Asia/Kolkata`; set it on the server too so "today" and time slots are Indian time). The medicine catalogue is loaded from `backend/data/medicines.json` the first time the backend connects to an empty database.

## Setup

Requirements: Node.js 18+ and MongoDB (local install or your own Atlas cluster).

1. **Install dependencies** (from this folder):
   ```bash
   npm run install:all
   ```

2. **Configure the backend.** Copy `backend/config/.env.example` to `backend/config/.env` and fill in:
   - `MONGO_URI`: `mongodb://127.0.0.1:27017/hospital_mis` for local MongoDB, or your Atlas connection string
   - `JWT_SECRET_KEY`: any long random string
   - `CLOUDINARY_*`: your Cloudinary keys (only needed to upload doctor photos)

3. **Configure the frontends.** Copy `.env.example` to `.env` in both `frontend/` and `dashboard/`. `VITE_API_URL` is the backend URL (default `http://localhost:4000`).

4. **Create the hospital admin** (once; the dashboard has no sign-up page and refuses a second admin):
   ```bash
   npm run create-admin -- you@example.com YourPassword123 Firstname Lastname
   ```
   To change the admin's password later:
   ```bash
   npm run set-admin-password -- NewPassword123
   ```

5. **Run everything:**
   ```bash
   npm run dev
   ```
   This starts the API, the patient site and the dashboard together. You can also run them separately with `npm run dev:backend`, `npm run dev:frontend` and `npm run dev:dashboard`.

## Postman

Import `postman/Hospital-MIS.postman_collection.json` into Postman.

- Set the collection variables `adminEmail` / `adminPassword` to the admin you created.
- Set `doctorEmail` / `doctorPassword` to a doctor's login to try the Doctor requests.
- Run **Staff session > Login Admin** (or Login Doctor) first. Login sets an httpOnly cookie that Postman keeps and sends with the protected requests. Only one staff session is active per browser/Postman at a time.
- **Get All Doctors** saves a `doctorId`; **Book Appointment** and **Get All Appointments** save the `appointmentId` used by the other requests.

## Deploying (GitHub → Render → Vercel)

The database is MongoDB Atlas; the backend runs on Render; the patient website and the staff dashboard are two Vercel projects. Secrets live only in Render's environment settings, never in GitHub (`.env` files are git-ignored).

1. **GitHub.** From this folder:
   ```bash
   git add .
   git commit -m "Hospital MIS: initial version"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. **MongoDB Atlas.** *Network Access* must allow `0.0.0.0/0` (Render has no fixed IP). Use the same connection string as in `backend/config/.env`.

3. **Render → New → Web Service** from the GitHub repo:
   - Root Directory `backend`, Build Command `npm install`, Start Command `npm start`
   - Environment variables (copy values from `backend/config/.env`):
     `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET_KEY`, `JWT_EXPIRES=7d`, `COOKIE_EXPIRES=7`, `ADMIN_SESSION_HOURS=8`, `CONSULTATION_FEE=500`, `TZ=Asia/Kolkata`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET_KEY`. Do **not** set `PORT` (Render provides it).
   - Note the service URL, e.g. `https://hospital-mis-api.onrender.com`. Check `<that URL>/api/v1/health` shows `{"ok":true}`.

4. **Point the dashboard at Render.** In `dashboard/vercel.json` replace `YOUR-RENDER-SERVICE.onrender.com` with your Render host, then commit and push. (The dashboard reaches the API through this `/api` pass-through, so login cookies are first-party and work in every browser.)

5. **Vercel → Add New → Project** (twice, same repo):
   - **Patient website:** Root Directory `frontend`, Framework Vite, environment variable `VITE_API_URL=https://<your-render-host>`.
   - **Staff dashboard:** Root Directory `dashboard`, Framework Vite, **no** `VITE_API_URL` (leave it unset).

6. **Back on Render**, add `FRONTEND_URL` and `DASHBOARD_URL` = the two Vercel URLs (no trailing slash), and redeploy.

7. **Keep it awake (free plan).** Render's free tier sleeps after 15 idle minutes (first request then takes ~1 minute). A free monitor such as UptimeRobot calling `https://<your-render-host>/api/v1/health` every 5 minutes prevents that.

8. **Test:** book an appointment on the website; log in to the dashboard as the admin (same login as locally: it's the same database); open the dashboard on a second device and check the **● Live** updates.

Notes: `vercel.json` in each app makes page refreshes work (`/appointment`, `/doctors`, …). Live updates use a long-lived connection; if a proxy closes it, the dashboard reconnects automatically and refetches.
