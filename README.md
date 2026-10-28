# MediTrack — Hospital Management System

MediTrack runs the day-to-day work of a hospital in one place: patients book appointments online, the front desk manages the day's queue and payments, doctors see their own patients and prescribe medicines, and the hospital's medicine store sells online and to patients after consultation.

| | Link | Used by |
|---|---|---|
| **Patient website** | https://hospital-mis-system.vercel.app | Patients and visitors |
| **Staff portal** (admin & doctors) | https://hospital-mis-system-p3i7.vercel.app | Hospital admin and doctors |

---

## Why use MediTrack

- **No waiting in line to book.** Patients pick a department, a doctor and a free time slot from their phone, any time of day.
- **No double bookings.** A slot taken with a doctor disappears for everyone else; Sundays and past times can't be booked.
- **The front desk sees the whole day at a glance.** Patients appear as a queue in time order; finished visits move to the bottom so the next patient is always on top.
- **Everyone stays in sync.** Several front-desk PCs and the doctors' screens update instantly when anyone changes something — no refreshing.
- **Billing without paperwork.** One consultation fee for every doctor, medicines added automatically, and a printable receipt with a receipt number for every visit.
- **The medicine store keeps its own stock.** Online orders and doctors' prescriptions reduce stock automatically; low stock is flagged and every sale is in one sheet that downloads to Excel.
- **Secure by role.** Patients need no account; staff log in as **Admin** or **Doctor** and only see what their role needs.

---

## How it works

```
Patient books online ──► Admin accepts ──► Patient arrives ──► Doctor consults ──► Payment & receipt
 (website, picks a         (staff portal)    (admin clicks       (notes + medicines   (doctor or admin,
  doctor & time slot)                         "Mark arrived")     from the store)      Cash / UPI / Card)
```

1. **Booking.** A patient fills in their details on the website, chooses a department, a doctor, a date and a 30-minute time slot. The consultation fee (₹500, same for every doctor) is shown; it is paid at the hospital.
2. **Review.** The admin sees the new request at once and **accepts** or **rejects** it.
3. **Arrival.** When the patient walks in, the admin clicks **Mark arrived**. The doctor's screen shows the patient as checked in.
4. **Consultation.** The doctor opens the patient, writes notes, browses the medicine store and adds the medicines to give, then either **collects payment** (fee + medicines) or sends the patient to reception to pay.
5. **Receipt.** A receipt (e.g. `MT-2026-00012`) is generated with the fee, each medicine and the doctor's notes, ready to print.

Everything is stored in one secure online database, so the website, the admin's screens and every doctor's screen always show the same information.

**Hospital hours used for booking:** Monday–Friday 9:00 AM – 7:00 PM, Saturday 9:00 AM – 5:00 PM, Sunday closed.

---

## Using the patient website

Open **https://hospital-mis-system.vercel.app** — no account needed.

| Page | What you can do |
|---|---|
| **Home / About Us** | Learn about the hospital and its departments |
| **Appointment** (or **Book Appointment**) | Fill in your details → choose department → choose doctor → choose date → choose a free time → **Get Appointment**. You'll see a confirmation with the doctor's name and time. |
| **Store** | Browse medicines by category, see price and stock, add to cart, check out with your delivery address. Payment is cash on delivery; you get an order number. |
| **Contact** (✉ icon) | Send the hospital a message; the admin reads it in the staff portal |

---

## Using the staff portal

Open **https://hospital-mis-system-p3i7.vercel.app**, choose **Admin** or **Doctor**, and log in with the login ID and password given by the hospital. The same admin login works on several PCs at once and stays signed in for a working shift (8 hours).

### For the hospital admin

The menu on the left (each icon is labelled; the current page is highlighted):

- **Appointments** — the main screen.
  - **Summary cards:** today's appointments, new requests, patients with a doctor, patients awaiting payment, and amount collected. Click a card to see those patients.
  - **Date picker (‹ date › / Today / All dates):** look at any day; the cards and the list follow the chosen date.
  - **Patient list:** each day is a queue — patients still to be handled first by time, finished ones (paid or rejected) dimmed at the bottom. Filter by status or search by name, phone, doctor or receipt number.
  - **Actions per patient:** set status (Pending / Accepted / Rejected) → **Mark arrived** → (doctor consults) → **Generate receipt** (choose Cash, UPI or Card) → print.
- **Doctors** — every doctor with photo, department, login ID and phone. Filter by department or search. **Add / Change photo** on each card.
- **Add Doctor** — a short form to register a doctor (photo optional). After saving, the doctor's **login ID and password** are shown once to hand over. Below it, **Remove a doctor**: search the doctor, select, and confirm with the **admin password**. Their upcoming appointments are cancelled; past visits and receipts are kept.
- **Medicines** — the store inventory (price, units in stock, units sold, low/out of stock, **Add stock**) and the **Orders** sheet with every sale (online and prescriptions), buyer details and payment status. **Download Excel (CSV)** for records. Mark cash-on-delivery orders as paid.
- **Messages** — messages sent from the website's Contact page, newest first, with tap-to-call and email links.

A green **● Live** badge means the screen updates by itself when anyone else makes a change.

### For doctors

- **My Patients** — your own appointments, with tabs for **Today**, **Waiting** (checked in), **Upcoming**, **Completed** and **All**, in queue order.
- **Mark consultation done** opens the consultation page:
  1. Write notes / advice (printed on the receipt).
  2. **Browse medicine store** — pick medicines by category or search; quantities are limited to what's in stock. **Done** brings them back to the bill.
  3. The bill shows the consultation fee + medicines. Choose **Collect now** (Cash / UPI / Card) to get the receipt immediately, or **Patient pays at reception**.
- **Password** — change the password the hospital gave you.

---

## Contact

- Phone: **+91 6359185847**
- Website: **https://hospital-mis-system.vercel.app**

---

## Built with

React (patient website and staff portal, hosted on Vercel) · Node.js & Express (server, hosted on Render) · MongoDB Atlas (database) · Cloudinary (doctor photos) · UptimeRobot.
