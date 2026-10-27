// Appointment time slots, following the hospital hours shown on the website:
// Mon–Fri 9:00 AM – 7:00 PM, Sat 9:00 AM – 5:00 PM, Sunday closed.
export const SLOT_MINUTES = 30;
const HOURS = { weekday: [9, 19], saturday: [9, 17] };

const pad = (n) => String(n).padStart(2, "0");

const weekday = (dateISO) => {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(y, m - 1, d).getDay(); // 0 = Sunday
};

export const isClosed = (dateISO) => weekday(dateISO) === 0;

// ["09:00", "09:30", ...] for the date (empty on Sundays)
export const slotsFor = (dateISO) => {
  const day = weekday(dateISO);
  if (day === 0) return [];
  const [open, close] = day === 6 ? HOURS.saturday : HOURS.weekday;
  const slots = [];
  for (let minutes = open * 60; minutes < close * 60; minutes += SLOT_MINUTES) {
    slots.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
  }
  return slots;
};

// Local "now" as YYYY-MM-DD and HH:MM, to hide slots that already passed today
export const nowLocal = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString("en-CA"),
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
};

export const timeLabel = (time) => {
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
};
