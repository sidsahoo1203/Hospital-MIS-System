// Today's date as YYYY-MM-DD in the browser's timezone (matches appointment_date)
export const todayISO = () => new Date().toLocaleDateString("en-CA");

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const formatDateTime = (value) =>
  value ? `${formatDate(value)}, ${formatTime(value)}` : "—";

export const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export const ageFrom = (dob) => {
  if (!dob) return "—";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
};

export const errorMessage = (error) =>
  error?.response?.data?.message || "Something went wrong. Please try again.";

// "14:30" -> "2:30 PM"
export const formatSlot = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

// Queue order for a day: by date, then patients still to be handled (by
// appointment time), then finished ones at the bottom (also by time).
export const queueOrder = (isFinished) => (a, b) =>
  a.appointment_date.slice(0, 10).localeCompare(b.appointment_date.slice(0, 10)) ||
  Number(isFinished(a)) - Number(isFinished(b)) ||
  (a.appointment_time || "99:99").localeCompare(b.appointment_time || "99:99") ||
  a._id.localeCompare(b._id);

// Hospital departments (Add Doctor form, Doctors page filter)
export const DEPARTMENTS = [
  "Pediatrics",
  "Orthopedics",
  "Cardiology",
  "Neurology",
  "Oncology",
  "Radiology",
  "Physical Therapy",
  "Dermatology",
  "ENT",
];
