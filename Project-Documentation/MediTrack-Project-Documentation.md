# MediTrack — Hospital Management System

*Complete Project Documentation — history, every change, the final system and how to use it*

| Part | Live link |
|---|---|
| Patient website | https://hospital-mis-system.vercel.app |
| Staff portal (Admin & Doctors) | https://hospital-mis-system-p3i7.vercel.app |
| Backend API (no home page) | https://hospital-mis-system-950b.onrender.com |
| Source code | https://github.com/sidsahoo1203/Hospital-MIS-System |

Owner: Siddharth Sahoo • Project period: 26 October – 3 November 2026

*This document contains no passwords. Logins are kept in LOCAL_ADMIN_CREDENTIALS.txt on your PC.*

## Contents

- [1. Summary at a glance](#1-summary-at-a-glance)
  - [What the system does today](#what-the-system-does-today)
  - [The journey in one table](#the-journey-in-one-table)
- [2. Detailed history — every step, how and why](#2-detailed-history-every-step-how-and-why)
  - [Phase 1 — Cloning the repository and running it for the first time](#phase-1-cloning-the-repository-and-running-it-for-the-first-time)
  - [Phase 2 — Moving the project into your own folder](#phase-2-moving-the-project-into-your-own-folder)
  - [Phase 3 — Making the project yours (no dependency on your friend)](#phase-3-making-the-project-yours-no-dependency-on-your-friend)
  - [Phase 4 — Connecting your own MongoDB Atlas database](#phase-4-connecting-your-own-mongodb-atlas-database)
  - [Phase 5 — Making everything work locally](#phase-5-making-everything-work-locally)
  - [Phase 6 — Real numbers on the dashboard](#phase-6-real-numbers-on-the-dashboard)
  - [Phase 7 — Demo data through the app's own pages](#phase-7-demo-data-through-the-app-s-own-pages)
  - [Phase 8 — Turning it into a real hospital workflow](#phase-8-turning-it-into-a-real-hospital-workflow)
  - [Phase 9 — Patient website polish](#phase-9-patient-website-polish)
  - [Phase 10 — Single admin, live sync, medicine store, prescriptions](#phase-10-single-admin-live-sync-medicine-store-prescriptions)
  - [Phase 11 — Doctors browse the medicine store](#phase-11-doctors-browse-the-medicine-store)
  - [Phase 12 — Admin home page redesign](#phase-12-admin-home-page-redesign)
  - [Phase 13 — Time slots, queue order and the sync audit](#phase-13-time-slots-queue-order-and-the-sync-audit)
  - [Phase 14 — Navigation and compact pages](#phase-14-navigation-and-compact-pages)
  - [Phase 15 — Doctor management](#phase-15-doctor-management)
  - [Phase 16 — Cloudinary and accounts review](#phase-16-cloudinary-and-accounts-review)
  - [Phase 17 — Deployment](#phase-17-deployment)
  - [Phase 18 — Final touches](#phase-18-final-touches)
- [3. The final system — how it is built](#3-the-final-system-how-it-is-built)
  - [Architecture](#architecture)
  - [Technology](#technology)
  - [Database collections](#database-collections)
  - [Project folders](#project-folders)
- [4. Features and how to use them](#4-features-and-how-to-use-them)
  - [Patient website — hospital-mis-system.vercel.app](#patient-website-hospital-mis-system-vercel-app)
  - [Staff portal — hospital-mis-system-p3i7.vercel.app](#staff-portal-hospital-mis-system-p3i7-vercel-app)
  - [Rules built into the system](#rules-built-into-the-system)
- [5. Technical reference](#5-technical-reference)
  - [API addresses](#api-addresses)
  - [Settings (environment variables)](#settings-environment-variables)
  - [Command-line tools (run inside the project folder)](#command-line-tools-run-inside-the-project-folder)
- [6. Deployment, maintenance and troubleshooting](#6-deployment-maintenance-and-troubleshooting)
  - [Where everything runs](#where-everything-runs)
  - [Updating the live system](#updating-the-live-system)
  - [Running it on your laptop (optional)](#running-it-on-your-laptop-optional)
  - [Troubleshooting](#troubleshooting)
  - [Accounts](#accounts)
- [7. Logins, data and future ideas](#7-logins-data-and-future-ideas)
  - [Logins (no passwords here)](#logins-no-passwords-here)
  - [Data currently in the database](#data-currently-in-the-database)
  - [Known limitations](#known-limitations)
  - [Ideas for next versions](#ideas-for-next-versions)

# 1. Summary at a glance

This project started as a MERN-stack hospital website that you and a friend had built, stored in your friend's GitHub repository. Over the course of this work it was cloned, repaired, moved onto **your own accounts**, redesigned into a real hospital workflow, extended with a medicine store, doctor prescriptions, payments and receipts, live multi-PC syncing, time-slot booking, and finally deployed online on **Render** (server), **Vercel** (two websites) and **MongoDB Atlas** (database).

## What the system does today

- **Patients** (no account) book appointments online by choosing a department, doctor, date and a free 30-minute time slot, buy medicines from the online store, and send messages to the hospital.
- **The hospital admin** (one shared account, usable on several PCs at once) sees each day as a queue, accepts or rejects bookings, marks patients as arrived, generates printable receipts, manages doctors, the medicine inventory and orders, and reads messages.
- **Doctors** (accounts created by the admin) see only their own patients, write consultation notes, prescribe medicines from the hospital store, and can collect the payment themselves.
- Every screen updates **live** when anything changes anywhere, without refreshing.
## The journey in one table

| Phase | What happened |
|---|---|
| 1. Clone & first run | Cloned the repo, fixed missing files and wrong server links, ran it locally. |
| 2. Own folder | Moved the project into Desktop\CODE\Hospital MIS System. |
| 3. Make it yours | Removed every link to your friend's accounts; settings moved to your own .env files; Postman collection; README. |
| 4. MongoDB Atlas | Connected your own cloud database and created your admin account. |
| 5. Full local run | Fixed the dashboard refresh bug; connected Cloudinary for doctor photos; tested every feature. |
| 6. Real counts | Dashboard boxes showed fake numbers (150 / 10); made them real. |
| 7. Demo data | Added 18 doctors (2 per department) and 18 patients through the app's own forms. |
| 8. Hospital workflow | Removed patient logins; doctor accounts & portal; arrival, consultation, ₹500 fee, receipts; remove doctor. |
| 9. Website polish | Fixed jumping text; tested contact form; fixed 5 store bugs. |
| 10. Big upgrade | Single admin, 8-hour sessions, live multi-PC updates, Medicine Store admin page, ₹ prices, saved orders, doctor prescriptions & billing. |
| 11. Doctor store browsing | Doctors pick medicines from a picture store page during consultation. |
| 12. Admin home redesign | Compact cards, whole-page scrolling, date picker, money by date. |
| 13. Time slots & queue | 30-minute slots, no double booking, queue order, full sync audit, two 28-Oct patients. |
| 14. Navigation & compact pages | Labelled sidebar, compact Doctors (department filter) and Messages pages. |
| 15. Doctor management | Compact Add Doctor form, optional photo, Change photo, password-protected removal. |
| 16. Accounts review | Explained Cloudinary; audited which accounts belong to whom. |
| 17. Deployment | Prepared the code, pushed to GitHub, deployed on Render + Vercel, fixed the Node 26 crash, verified live. |
| 18. Final touches | Real phone number (+91 6359185847) and one common website contact; README for users. |

# 2. Detailed history — every step, how and why

Each phase below records **what** was done, **why** it was needed and **how** it was done, including the problems that were found along the way.

## Phase 1 — Cloning the repository and running it for the first time

**Starting point:** you asked to clone `github.com/Stranger-Siv/MERN-Stack-Hospital-MIS-with-Store-` (your friend's repository) and run it.

### Problems found and how they were solved

| Problem | Why it happened | Fix |
|---|---|---|
| Clone failed: "Filename too long" | Windows limits path length; the temporary folder path was very long. | Cloned with Git's long-path support (`core.longpaths=true`) into a short folder name. |
| Patient website would not compile | The last commit in the repo had deleted `Store_Cart.jsx`, `Store_Navbar.jsx` and `Store_ExploreMenu.jsx` while other files still imported them — a bug in the original repo. | Restored the three files from the previous commit in Git history. |
| Websites talked to your friend's server | Both front-ends had the Render address `meditrack-svcx.onrender.com` written into 16 places. | Pointed them to the local server (later made configurable). |
| Database belonged to your friend | The committed `.env` contained your friend's MongoDB Atlas password (publicly visible). | Used the MongoDB installed on your PC instead; did not use the friend's credentials. |
| Port 5173 was busy | Another program on your PC used it. | Ran on other ports and adjusted the allowed-origins (CORS) list. |
| No admin to log in with | A fresh database has no admin account. | Created a local test admin. |

**Result:** backend, patient website and admin dashboard all ran locally; admin login and the store worked.

## Phase 2 — Moving the project into your own folder

The project lived in a temporary session folder that would be deleted. At your request it was moved to **`Desktop\CODE\Hospital MIS System`**. The app copied the files but intentionally not `.git`, `.env` files or `node_modules`; these were recreated or reinstalled. Your friend's Git history was not carried over, as you asked.

## Phase 3 — Making the project yours (no dependency on your friend)

**Why:** you want to own and deploy the project with your own accounts.

- **Settings moved into `.env` files.** Backend: database link, login security key (a new random one was generated, so it is not your friend's), allowed website addresses, Cloudinary keys. Front-ends: `VITE_API_URL` (the server address). Templates (`.env.example`) were added so the settings are documented without secrets.
- **Removed a hidden background job** that pinged your friend's Render server every 30 seconds forever.
- **Fixed `.gitignore`.** It pointed at the wrong path, so the real `.env` with secrets would have been uploaded to GitHub.
- **One-command start:** `npm run dev` at the top level starts all three parts together; `npm run install:all` installs everything; `nodemon` (auto-restart) was missing and was added.
- **`create-admin` script** to create the admin account from the command line.
- **Postman collection** (`postman/Hospital-MIS.postman_collection.json`) with every API request for testing.
- **Login cookies** made to work on plain `http://localhost` (for development) and secure on HTTPS in production.
## Phase 4 — Connecting your own MongoDB Atlas database

1. You created a free M0 cluster `hospital-mis`, a database user and allowed network access `0.0.0.0/0`.
2. You put the connection string into `backend/config/.env`. It was missing the database name, so data would have gone into a database called `test`; `/hospital_mis` was added.
3. The connection was tested, a test message was written and deleted to prove the app used Atlas.
4. An old backend process was still holding port 4000 and was stopped.
5. Your admin account `siddharth@gmail.com` was created in Atlas (password kept in `LOCAL_ADMIN_CREDENTIALS.txt`).

## Phase 5 — Making everything work locally

- **Dashboard refresh bug fixed:** refreshing any admin page except home sent you back, because pages decided "not logged in" before the server answered. The app now waits for the login check first.
- **Cloudinary** (doctor photos): your friend's Cloudinary keys were placed in `.env` at your request and verified.
- **End-to-end test:** added a doctor with photo, registered a patient, booked, accepted, sent messages — all worked; the test data was then deleted from Atlas and Cloudinary.
## Phase 6 — Real numbers on the dashboard

The "Total Appointments 150" and "Registered Doctors 10" boxes were typed into the code. They were connected to the real counts. A React console warning in the same table was also fixed.

## Phase 7 — Demo data through the app's own pages

- 18 doctors — 2 in each of the 9 departments (Pediatrics, Orthopedics, Cardiology, Neurology, Oncology, Radiology, Physical Therapy, Dermatology, ENT) — added through the Add Doctor form, each with a matching photo.
- 18 patients registered on the patient website and each booked one appointment with a different doctor (3–26 November 2026).
- Demo doctor logins use the pattern `firstname.lastname@example.com` (password in the credentials file).
## Phase 8 — Turning it into a real hospital workflow

**Your request:** the hospital admin manages everything; doctors get their own login ID and password from the admin; doctors see their patients' in/out; the admin can add or delete doctors, accept/reject appointments, mark arrival and generate a payment receipt; ₹500 per consultation for every doctor; remove patient login completely.

### What was built

- **Patient login and registration removed.** Patients book without an account. The navbar's LOGIN button became BOOK APPOINTMENT; old `/login` links go to the home page.
- **Roles:** Admin and Doctor log in on the same staff portal with an Admin/Doctor switch. The server checks the role on every request.
- **Doctor accounts:** the admin creates them (with a Generate-password button) and sees the login details once to hand over.
- **Hospital flow:** Pending → Accepted/Rejected → **Mark arrived** (check-in time) → doctor **Mark consultation done** (check-out time) → **Generate receipt** (Cash/UPI/Card) → printable receipt `MT-2026-00001`.
- **Fixed fee:** ₹500 for all doctors (setting `CONSULTATION_FEE`), shown on the booking form.
- **Doctor portal:** “My Patients” with tabs Today / Waiting / Upcoming / Completed / All, and Change Password.
- **Remove doctor:** cancels their open appointments, keeps visited/paid ones.
### Hidden bugs fixed during this phase

| Bug | Effect | Fix |
|---|---|---|
| Login token hard-coded to 1 hour | Everyone was silently logged out after an hour. | Uses the configured session length. |
| Password re-hashed on every save | Any later save to a user would break their login. | Hash only when the password changes. |
| Error handler bug | Invalid IDs and duplicate emails crashed with 500 errors. | Proper error messages. |
| Doctor chosen by splitting name on a space | Doctors with two-word names could not be booked. | Booking uses the doctor's ID. |
| “Have you visited before?” checkbox | Patients could mark themselves as arrived. | Removed. |

## Phase 9 — Patient website polish

- **“Moving up and down” text fixed.** Headings and the doctor image had tiny scroll boxes because a CSS rule gave every element `overflow-x: hidden`; it now applies only to the page body.
- **Contact form tested:** 3 messages sent from the website appeared on the admin Messages page.
- **Store bugs fixed:** checkout accepted an empty form and empty cart; the cart never emptied after ordering; an empty cart showed a blank box; refreshing lost the cart (now saved in the browser); a promo could make the total negative.
## Phase 10 — Single admin, live sync, medicine store, prescriptions

- **Exactly one admin.** The Add Admin page was removed; the `create-admin` script refuses a second admin; `set-admin-password` changes the admin password from the command line. Admin's Change Password page removed.
- **Admin session = 8 hours** (`ADMIN_SESSION_HOURS`), and the same login works on several PCs at once. When the session ends the page says “Your session has ended” and returns to login.
- **Live updates (Server-Sent Events):** the server broadcasts a short notice whenever data changes; every open screen reloads just that data. A green ● Live badge shows the connection.
- **Dr. sid kumar's photo** replaced with a stock doctor photo.
- **Medicine Store admin page:** 96 medicines loaded into the database automatically, with stock, units sold, low/out-of-stock flags, Add stock, and an Excel-style Orders sheet with Download CSV.
- **Store switched to ₹** (old dollar prices × 10, rounded to ₹5), ₹40 delivery, DISCOUNT10 = 10% off. Online orders are now saved (`ORD-2026-00001`) and reduce stock; two buyers cannot both get the last unit.
- **Doctor consultation page:** notes, medicines from stock, bill = fee + medicines, collect now (Cash/UPI/Card) or pay at reception. Receipts list each medicine and the notes.
- **Dashboard CSS bug:** the same `overflow-x` problem existed in the dashboard and was fixed.
## Phase 11 — Doctors browse the medicine store

At your request the search box on the consultation page became a **Browse medicine store** button that opens a picture store page (96 product photos copied into the dashboard, category tabs, search, stock-limited quantities). **Done — back to consultation** returns with the picks. Notes and picks survive page changes and refreshes until the consultation is completed.

## Phase 12 — Admin home page redesign

- The three large boxes were replaced by a greeting line and five compact clickable cards: Today's appointments, New requests, With doctor, Awaiting payment, Amount collected.
- The whole page now scrolls with the patient list; column headings stay pinned.
- A **date picker** (‹ date ›, Today, All dates) filters the list and the cards to any day.
- **Money by date fix:** collections were counted by the day the receipt was made; they are now counted by the appointment date. With All dates, the card shows the total of every day.
## Phase 13 — Time slots, queue order and the sync audit

- **Time slots:** Mon–Fri 9:00 AM–7:00 PM, Sat 9:00 AM–5:00 PM, Sunday closed, 30 minutes each. Taken slots show “not available”; the server refuses double booking. Existing appointments received times.
- **Queue order:** on each date, patients still to be handled come first by time; finished visits (paid/rejected) move down and are dimmed.
- **Time zone fix:** “today” was computed in UTC (wrong before 5:30 AM IST); the server now uses `TZ=Asia/Kolkata`.
- **Sync audit:** every admin action was checked against all cards and the list, including changes from a second PC. Two 28-Oct patients were added through the website: **Pooja Behera** (completed and paid ₹595, receipt MT-2026-00009) and **Manas Rout** (accepted, not arrived).
## Phase 14 — Navigation and compact pages

- Sidebar icons now have labels and the current page is highlighted; the phone menu no longer covers headings.
- Doctors page: compact cards, department chips with counts, search — all 18 doctors on one screen.
- Messages page: one compact row per message with received time and search.
## Phase 15 — Doctor management

- Remove buttons taken off the Doctors page; **Change photo** added instead.
- Add Doctor became a compact one-screen form; the **photo is optional** (placeholder until added).
- **Remove a doctor** section: search, select, confirm with the **admin password**. Tested with a trial doctor: wrong password refused, correct password removed.
## Phase 16 — Cloudinary and accounts review

Explained that Cloudinary stores only doctor photos (Render's disk is wiped on restart). At your request it stays on your friend's account. Audit: MongoDB = yours, security key = yours, Cloudinary = friend's, GitHub/Render/Vercel = yours (set up during deployment).

## Phase 17 — Deployment

| Step | Detail |
|---|---|
| Preparation | Removed a stale Git lock file that blocked commits; confirmed no secrets would be uploaded; added `vercel.json` to both sites (page-refresh fix; dashboard passes `/api` through to Render so logins work in all browsers); added `/api/v1/health`; trusted Render's proxy. |
| Cleanup | At your request the `.git` and `.claude` folders were deleted so the repository has no mention of Claude; you re-created Git with `git init`. |
| GitHub | You pushed to `github.com/sidsahoo1203/Hospital-MIS-System`. |
| Render crash | Render picked Node.js 26, which removed `SlowBuffer` used by the login library. Fixed by requiring Node 24 (`engines: 24.x`). |
| “Cannot GET /” | Not an error: the API has no home page. Health, doctors and fee addresses were verified. |
| Vercel | Two projects: website (`frontend`, with `VITE_API_URL`) and staff portal (`dashboard`, no variable). |
| Final check | Website allowed by the server (CORS), admin login works through the portal with a secure cookie, 23 appointments visible, live stream connects. |

## Phase 18 — Final touches

- Placeholder contacts (9876543210, support@MediTrack.com, contact@tomato.com) replaced by **+91 6359185847** (tap-to-call) and one common website link **hospital-mis-system.vercel.app**.
- README rewritten for users: what the system is, why use it, how it works and how to use it from the live links.
# 3. The final system — how it is built

## Architecture

```
  Patients (phone / PC)              Hospital staff (several PCs)
          |                                      |
  Patient website (Vercel)           Staff portal (Vercel)
  hospital-mis-system.vercel.app     hospital-mis-system-p3i7.vercel.app
          |  direct API calls                    |  /api pass-through
          +-------------------+------------------+
                              |
                 Backend API (Render, Node 24)
                 hospital-mis-system-950b.onrender.com
                    |                         |
          MongoDB Atlas (your data)     Cloudinary (doctor photos)
```

## Technology

| Layer | Technology | Hosted on |
|---|---|---|
| Patient website | React 18, Vite, Tailwind CSS, React Router | Vercel |
| Staff portal | React 18, Vite, React Router, react-toastify | Vercel |
| Backend API | Node.js 24, Express, Mongoose, JWT cookies, Server-Sent Events | Render (free plan) |
| Database | MongoDB Atlas (cluster `hospital-mis`, database `hospital_mis`) | MongoDB Atlas (free M0) |
| Photos | Cloudinary | Friend's Cloudinary account |

## Database collections

| Collection | What it stores |
|---|---|
| users | The single Admin and all Doctors (name, email = login ID, hashed password, phone, NIC, DOB, gender, department, photo). Old patient accounts may remain but cannot log in. |
| appointments | Patient details, date, time slot, department, doctor, status, arrived time, consultation-done time, consultation fee, prescription (notes, medicines, total), payment (method, amount, receipt number, paid time). |
| medicines | 96 medicines: code, name, category, description, price (₹), stock, units sold. |
| orders | Every medicine sale: order number, source (Store or Prescription), buyer details, items, subtotal, delivery, discount, total, payment status, doctor. |
| messages | Messages from the website's Contact page. |

## Project folders

| Folder / file | Purpose |
|---|---|
| backend/ | Server: `app.js`, `server.js`, `controller/`, `models/`, `router/`, `middlewares/`, `utils/` (events, fees, slots, stock, numbering, session), `scripts/` (create-admin, set-admin-password), `data/medicines.json`. |
| frontend/ | Patient website (pages: Home, Appointment, About, Store, Cart, Checkout, Order confirmed, Contact). |
| dashboard/ | Staff portal (Dashboard, Doctors, Add Doctor, Medicines, Messages, Doctor home, Consultation, Prescription store, Receipt, Change password, Login, Sidebar). |
| postman/ | API test collection for Postman. |
| README.md | User guide shown on GitHub. |
| LOCAL_ADMIN_CREDENTIALS.txt | Your logins (never uploaded to GitHub). |

# 4. Features and how to use them

## Patient website — hospital-mis-system.vercel.app

| Feature | How to use |
|---|---|
| Book an appointment | Appointment → fill name, email, mobile, NIC, date of birth, gender → choose department → doctor → date → a free time → address → GET APPOINTMENT. A confirmation shows the doctor and time. Fee ₹500 is paid at the hospital. |
| Medicine store | Store → pick a category → add medicines (stock-limited) → cart (survives refresh) → checkout with delivery address, PIN and phone → optional promo DISCOUNT10 → Place Order → order number shown. Cash on delivery, ₹40 delivery. |
| Contact | ✉ icon → write a message → it appears on the admin's Messages page. |
| Contact details | Phone +91 6359185847, website hospital-mis-system.vercel.app (footer, Contact, Appointment and Store pages). |

## Staff portal — hospital-mis-system-p3i7.vercel.app

Choose **Admin** or **Doctor**, enter the login ID (email) and password.

### Admin: Appointments (home)

- **Cards:** Today's appointments, New requests, With doctor, Awaiting payment, Amount collected. Click a card to show those patients.
- **Date picker:** ‹ / › step a day, Today, All dates; cards and list follow the date. Amount collected = total of all days, or that day's total.
- **List:** queue per day (to-do by time first, finished dimmed below); filter tabs All, Today, Pending, Accepted, With doctor, Awaiting payment, Paid, Rejected; search by patient, phone, doctor or receipt.
- **Actions:** status dropdown → Mark arrived (undo possible before payment) → Generate receipt (choose Cash/UPI/Card; prescribed medicines included) → Print.
### Admin: other pages

| Page | What you can do |
|---|---|
| Doctors | All doctors with photo, department, login ID, phone, age. Department chips with counts, search. Add / Change photo. |
| Add Doctor | Compact form (photo optional, Generate password). Login details shown once with Copy. Below: Remove a doctor (search → Select → admin password). |
| Medicines | Inventory (price, stock, sold, low/out of stock, Add stock) and Orders sheet (every sale, buyer, items, payment). Download Excel (CSV). Mark paid for cash-on-delivery orders. |
| Messages | Website messages, newest first, tap-to-call and email links, search. |

### Doctor portal

1. **My Patients** lists your appointments (Today, Waiting, Upcoming, Completed, All) in queue order with check-in times.
2. When a patient has arrived, click **Mark consultation done**.
3. Write notes, click **Browse medicine store**, add medicines, then **Done — back to consultation**.
4. Check the bill (₹500 + medicines). Choose **Collect now** (Cash/UPI/Card) to get the receipt, or **Patient pays at reception**.
5. **Password** page: change your password.

## Rules built into the system

| Rule | Value |
|---|---|
| Consultation fee | ₹500 for every doctor (setting CONSULTATION_FEE). |
| Hours / slots | Mon–Fri 9 AM–7 PM, Sat 9 AM–5 PM, Sunday closed; 30-minute slots; no double booking; no past times. |
| Status flow | Pending → Accepted / Rejected; status locks once the patient has arrived. |
| Receipts | MT-<year>-<number>, continuous; fee + medicines; doctor's notes printed. |
| Orders | ORD-<year>-<number>; store orders cash on delivery; prescriptions paid with the visit receipt. |
| Stock | Taken atomically; refused if not enough; Add stock on Medicines page. |
| Store pricing | ₹40 delivery; DISCOUNT10 = 10% off; prices set by the server. |
| Sessions | Admin 8 hours (ADMIN_SESSION_HOURS), several PCs at once; doctors 7 days; one staff login per browser. |
| Removing a doctor | Needs admin password; open appointments cancelled; history kept. |
| Time zone | Asia/Kolkata. |

# 5. Technical reference

## API addresses

| Method & address | Who | Purpose |
|---|---|---|
| GET /api/v1/health | Public | Server alive check (UptimeRobot) |
| GET /api/v1/user/doctors | Public | List doctors |
| POST /api/v1/user/login • GET /me • GET /logout | Staff | Login, current user, logout |
| PUT /api/v1/user/password | Doctor | Change own password |
| POST /api/v1/user/doctor/addnew | Admin | Add doctor (photo optional) |
| PUT /api/v1/user/doctor/:id/photo | Admin | Add/change photo |
| DELETE /api/v1/user/doctor/:id | Admin + password | Remove doctor |
| GET /api/v1/appointment/fee • /slots | Public | Fee; free time slots |
| POST /api/v1/appointment/post | Public | Book appointment |
| GET /api/v1/appointment/getall | Admin | All appointments |
| PUT /appointment/update/:id • /visit/:id | Admin | Status; mark arrived |
| POST /appointment/receipt/:id | Admin | Generate receipt |
| DELETE /appointment/delete/:id | Admin | Delete appointment |
| GET /appointment/mine • PUT /complete/:id | Doctor | Own patients; complete consultation |
| GET /appointment/:id | Admin or own doctor | One appointment / receipt |
| GET /api/v1/medicines • POST /medicines/orders | Public | Prices & stock; place store order |
| PUT /medicines/:code/stock • GET /orders/all • PUT /orders/:id/paid | Admin | Restock; orders; mark paid |
| POST /api/v1/message/send • GET /message/getall | Public / Admin | Contact messages |
| GET /api/v1/events | Staff | Live updates stream |

## Settings (environment variables)

Values are in `backend/config/.env` on your PC and in Render's Environment page. Never upload them to GitHub.

| Name | Meaning |
|---|---|
| NODE_ENV | `production` on Render (secure cookies). |
| MONGO_URI | Your Atlas connection string. |
| JWT_SECRET_KEY | Secret used to sign logins. |
| JWT_EXPIRES / COOKIE_EXPIRES | Doctor login length (7d / 7). |
| ADMIN_SESSION_HOURS | Admin login length (8). |
| CONSULTATION_FEE | Fee in ₹ (500). |
| TZ | Asia/Kolkata. |
| CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET_KEY | Photo storage keys. |
| FRONTEND_URL / DASHBOARD_URL | The two Vercel addresses (allowed origins). |
| VITE_API_URL (Vercel website only) | https://hospital-mis-system-950b.onrender.com |

## Command-line tools (run inside the project folder)

```
npm run create-admin -- you@example.com Password123 First Last   (only if no admin exists)
npm run set-admin-password -- NewPassword123                       (change admin password)
```

# 6. Deployment, maintenance and troubleshooting

## Where everything runs

| Service | Settings |
|---|---|
| GitHub | Repository sidsahoo1203/Hospital-MIS-System, branch main. |
| Render | Web Service, Root `backend`, Build `npm install`, Start `npm start`, Node 24, environment variables as in section 5, region Singapore. |
| Vercel — website | Root `frontend`, Vite, `VITE_API_URL` = Render address. `vercel.json` handles page refresh. |
| Vercel — staff portal | Root `dashboard`, Vite, no variables. `vercel.json` forwards /api to Render. |
| MongoDB Atlas | Network Access 0.0.0.0/0. |
| UptimeRobot (recommended) | HTTP(s) monitor on https://hospital-mis-system-950b.onrender.com/api/v1/health every 5 minutes. |

## Updating the live system

Change files on your PC, then run in the project folder:

```
git add .
git commit -m "describe the change"
git push
```

Render and both Vercel projects redeploy automatically in a few minutes. In Vercel, **Instant Rollback** restores the previous version if something goes wrong.

## Running it on your laptop (optional)

```
npm run dev
```

Starts the backend (4000), website (5173) and staff portal (5174). It uses the same Atlas database as the live site.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| First page load takes ~1 minute | Render free plan was asleep — set up UptimeRobot. |
| “Cannot GET /” on the Render link | Normal — the API has no home page. Check /api/v1/health. |
| Website shows no doctors | Wrong VITE_API_URL on Vercel (no trailing /); redeploy. |
| Admin keeps getting logged out | Session ended (8 h) — log in again; or Render missing NODE_ENV=production. |
| Times off by 5½ hours | TZ=Asia/Kolkata missing on Render. |
| Render deploy fails after an update | Read Render → Logs; Node must be 24 (`engines` in backend/package.json). |
| Photo upload fails | Cloudinary keys missing/changed — doctors can still be added without a photo. |

## Accounts

| Account | Owner |
|---|---|
| MongoDB Atlas | You |
| GitHub | You (sidsahoo1203) |
| Render | You |
| Vercel | You |
| Cloudinary | Your friend (kept by choice; swap the 3 keys to move to your own) |

# 7. Logins, data and future ideas

## Logins (no passwords here)

- **Admin:** siddharth@gmail.com — password in `LOCAL_ADMIN_CREDENTIALS.txt`; change it with `npm run set-admin-password`.
- **Doctors:** login IDs like `arjun.iyer@example.com`; demo password in the credentials file; each doctor can change it under Password.
- **Patients:** no accounts.
## Data currently in the database

- 18 doctors across 9 departments; around 23 appointments with times and several paid receipts (MT-2026-00001 onward); 96 medicines; store and prescription orders (ORD-2026-00001 onward); contact messages.
## Known limitations

- Payments are recorded, not processed online (no payment gateway).
- No SMS/email notifications yet.
- Render free plan sleeps without a monitor.
- Photos use your friend's Cloudinary account.
- npm reports old-library warnings (not blocking); updating them is a future task.
## Ideas for next versions

- Patient visit history; reschedule; walk-in registration; doctor leave days.
- SMS/WhatsApp confirmations and reminders; email receipts.
- Daily/monthly reports and charts; online payments (UPI gateway).
- Edit doctor details; manage medicine catalogue; order delivery tracking.
- Custom domain; own Cloudinary account; library updates; automated tests.