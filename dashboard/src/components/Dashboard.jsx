import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  errorMessage,
  formatDate,
  formatMoney,
  formatSlot,
  formatTime,
  queueOrder,
  todayISO,
} from "../utils";
import { LiveBadge, useLiveUpdates } from "../live";

// Filter tabs (and the summary cards, which open the matching tab)
const filters = {
  All: () => true,
  Today: (a) => a.appointment_date.slice(0, 10) === todayISO() && a.status !== "Rejected",
  Pending: (a) => a.status === "Pending",
  Accepted: (a) => a.status === "Accepted" && !a.hasVisited,
  "With doctor": (a) => a.hasVisited && !a.consultationCompletedAt,
  "Awaiting payment": (a) => a.hasVisited && a.payment?.status !== "Paid",
  Paid: (a) => a.payment?.status === "Paid",
  Rejected: (a) => a.status === "Rejected",
};

// YYYY-MM-DD shifted by whole days (local time)
const shiftDate = (iso, days) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d + days).toLocaleDateString("en-CA");
};

const shortDate = (iso) =>
  new Date(`${iso}T00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

// Admin's view of "done": paid or rejected (nothing left to do at the desk)
const isFinished = (a) => a.status === "Rejected" || a.payment?.status === "Paid";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  // "" = all dates; otherwise the list and cards show only this day (YYYY-MM-DD)
  const [date, setDate] = useState("");
  const [receiptFor, setReceiptFor] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [busy, setBusy] = useState(false);
  const { user } = useContext(Context);
  const navigateTo = useNavigate();
  const patientsRef = useRef(null);

  const fetchDoctorsCount = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/user/doctors", {
        withCredentials: true,
      });
      setDoctorsCount(data.doctors.length);
    } catch (error) {
      setDoctorsCount(0);
    }
  }, []);
  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/appointment/getall", {
        withCredentials: true,
      });
      setAppointments(data.appointments);
    } catch (error) {
      setAppointments([]);
    }
  }, []);
  useEffect(() => {
    fetchDoctorsCount();
    fetchAppointments();
  }, [fetchDoctorsCount, fetchAppointments]);
  // Changes made on other PCs (or by doctors) show up without a refresh
  useLiveUpdates(["appointments"], fetchAppointments);
  useLiveUpdates(["doctors"], fetchDoctorsCount);

  const replaceAppointment = (updated) =>
    setAppointments((prev) =>
      prev.map((a) => (a._id === updated._id ? updated : a))
    );

  const callApi = async (request) => {
    setBusy(true);
    try {
      const { data } = await request();
      replaceAppointment(data.appointment);
      toast.success(data.message);
      return data.appointment;
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateStatus = (id, status) =>
    callApi(() =>
      axios.put(`/api/v1/appointment/update/${id}`, { status }, { withCredentials: true })
    );

  const handleVisited = (id, visited) =>
    callApi(() =>
      axios.put(`/api/v1/appointment/visit/${id}`, { visited }, { withCredentials: true })
    );

  const handleGenerateReceipt = async () => {
    const updated = await callApi(() =>
      axios.post(
        `/api/v1/appointment/receipt/${receiptFor._id}`,
        { method: paymentMethod },
        { withCredentials: true }
      )
    );
    if (updated) {
      setReceiptFor(null);
      navigateTo(`/receipt/${updated._id}`);
    }
  };

  // Appointments on the picked date (all of them when no date is picked)
  const scoped = useMemo(
    () => (date ? appointments.filter((a) => a.appointment_date.slice(0, 10) === date) : appointments),
    [appointments, date]
  );

  const stats = useMemo(() => {
    const day = date || todayISO();
    const onDay = appointments.filter(
      (a) => a.appointment_date.slice(0, 10) === day && a.status !== "Rejected"
    );
    const paid = appointments.filter(filters.Paid);
    // Money is counted by the appointment's date (the date being viewed),
    // not by the day the receipt happened to be generated
    const paidForDay = onDay.filter(filters.Paid);
    const sum = (list) => list.reduce((total, a) => total + (a.payment.amount || 0), 0);
    return {
      onDay: onDay.length,
      arrivedOnDay: onDay.filter((a) => a.hasVisited).length,
      pending: scoped.filter(filters.Pending).length,
      withDoctor: scoped.filter(filters["With doctor"]).length,
      awaitingPayment: scoped.filter(filters["Awaiting payment"]).length,
      collectedOnDay: sum(paidForDay),
      paidOnDay: paidForDay.length,
      collectedTotal: sum(paid),
      paidTotal: paid.length,
    };
  }, [appointments, scoped, date]);

  // Summary card -> show those patients in the list below
  useEffect(() => {
    if (date && filter === "Today") setFilter("All");
  }, [date, filter]);

  const showFilter = (name) => {
    setFilter(name);
    // Only scroll when the list starts below the visible area (small screens)
    const panel = patientsRef.current;
    if (panel && panel.getBoundingClientRect().top > window.innerHeight * 0.6) {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const dayLabel = date && date !== todayISO() ? shortDate(date) : "";
  const cards = [
    {
      // With a date picked the whole list is that day, so the card shows "All"
      filter: date ? "All" : "Today",
      label: dayLabel ? `Appointments · ${dayLabel}` : "Today's appointments",
      value: stats.onDay,
      hint: `${stats.arrivedOnDay} arrived`,
    },
    { filter: "Pending", label: "New requests", value: stats.pending, hint: "Accept or reject", tone: stats.pending ? "warn" : "" },
    { filter: "With doctor", label: "With doctor", value: stats.withDoctor, hint: "Checked in, being seen" },
    { filter: "Awaiting payment", label: "Awaiting payment", value: stats.awaitingPayment, hint: "Generate receipt", tone: stats.awaitingPayment ? "warn" : "" },
    // All dates: everything collected so far; a picked date: that day's visits
    date
      ? { filter: "Paid", label: `Amount collected · ${shortDate(date)}`, value: formatMoney(stats.collectedOnDay), hint: `${stats.paidOnDay} of ${stats.onDay} visits paid`, tone: "money" }
      : { filter: "Paid", label: "Amount collected", value: formatMoney(stats.collectedTotal), hint: `${stats.paidTotal} paid visits`, tone: "money" },
  ];

  const visible = scoped.filter(filters[filter]).sort(queueOrder(isFinished)).filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [
      `${a.firstName} ${a.lastName}`,
      a.phone,
      `${a.doctor.firstName} ${a.doctor.lastName}`,
      a.department,
      a.payment?.receiptNumber,
    ]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  });

  return (
    <>
      <section className="dashboard page admin-home">
        <header className="dash-header">
          <div>
            <h1>
              {greeting()}, {user && `${user.firstName} ${user.lastName}`}
            </h1>
            <p className="muted">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · <Link to="/doctors">{doctorsCount} doctors</Link>
            </p>
          </div>
          <LiveBadge />
        </header>

        <div className="kpi-grid">
          {cards.map((card) => (
            <button
              key={card.filter}
              className={`kpi ${card.tone || ""} ${filter === card.filter ? "active" : ""}`}
              onClick={() => showFilter(card.filter)}
            >
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">{card.value}</span>
              <span className="kpi-hint">{card.hint}</span>
            </button>
          ))}
        </div>

        <div className="banner patients-panel" ref={patientsRef}>
          <div className="table-header">
            <h5>Patients</h5>
            <span className="muted">
              Showing {visible.length} of {appointments.length}
              {date && ` · ${formatDate(date)}`}
            </span>
          </div>
          <div className="table-tools">
            <div className="filter-tabs" role="tablist" aria-label="Filter appointments">
              {Object.keys(filters)
                // "Today" is redundant while a specific date is picked
                .filter((name) => !(date && name === "Today"))
                .map((name) => (
                  <button
                    key={name}
                    role="tab"
                    aria-selected={filter === name}
                    className={filter === name ? "active" : ""}
                    onClick={() => setFilter(name)}
                  >
                    {name}
                  </button>
                ))}
            </div>
            <div className="tools-right">
              <div className="date-nav" role="group" aria-label="Show appointments for a date">
                <button
                  className="icon-btn"
                  aria-label="Previous day"
                  title="Previous day"
                  onClick={() => setDate(shiftDate(date || todayISO(), -1))}
                >
                  ‹
                </button>
                <input
                  type="date"
                  aria-label="Appointment date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <button
                  className="icon-btn"
                  aria-label="Next day"
                  title="Next day"
                  onClick={() => setDate(shiftDate(date || todayISO(), 1))}
                >
                  ›
                </button>
                <button
                  className={`chip ${date === todayISO() ? "active" : ""}`}
                  onClick={() => {
                    setDate(todayISO());
                    if (filter === "Today") setFilter("All");
                  }}
                >
                  Today
                </button>
                <button
                  className={`chip ${!date ? "active" : ""}`}
                  onClick={() => setDate("")}
                >
                  All dates
                </button>
              </div>
              <input
                type="search"
                className="table-search"
                placeholder="Search patient, phone, doctor, receipt…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-scroll">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Arrived</th>
                  <th>Consultation</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {visible.length > 0 ? (
                  visible.map((appointment) => {
                    const paid = appointment.payment?.status === "Paid";
                    return (
                      <tr key={appointment._id} className={isFinished(appointment) ? "finished" : ""}>
                        <td>
                          {`${appointment.firstName} ${appointment.lastName}`}
                          <small>{appointment.phone}</small>
                        </td>
                        <td>
                          {formatDate(appointment.appointment_date)}
                          <small>{formatSlot(appointment.appointment_time)}</small>
                        </td>
                        <td>
                          {`Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                          <small>{appointment.department}</small>
                        </td>
                        <td>
                          {appointment.hasVisited ? (
                            // Locked once the patient has arrived
                            <span className={`value-${appointment.status.toLowerCase()}`}>
                              {appointment.status}
                            </span>
                          ) : (
                            <select
                              className={`value-${appointment.status.toLowerCase()}`}
                              value={appointment.status}
                              disabled={busy}
                              onChange={(e) =>
                                handleUpdateStatus(appointment._id, e.target.value)
                              }
                            >
                              <option value="Pending" className="value-pending">Pending</option>
                              <option value="Accepted" className="value-accepted">Accepted</option>
                              <option value="Rejected" className="value-rejected">Rejected</option>
                            </select>
                          )}
                        </td>
                        <td>
                          {appointment.hasVisited ? (
                            <span className="done">
                              ✓ {formatTime(appointment.visitedAt)}
                              {!paid && (
                                <button
                                  className="link-btn"
                                  disabled={busy}
                                  onClick={() => handleVisited(appointment._id, false)}
                                >
                                  undo
                                </button>
                              )}
                            </span>
                          ) : appointment.status === "Accepted" ? (
                            <button
                              className="action-btn"
                              disabled={busy}
                              onClick={() => handleVisited(appointment._id, true)}
                            >
                              Mark arrived
                            </button>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          {appointment.consultationCompletedAt ? (
                            <span className="done">✓ {formatTime(appointment.consultationCompletedAt)}</span>
                          ) : appointment.hasVisited ? (
                            <span className="waiting">With doctor</span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          {paid ? (
                            <button
                              className="link-btn"
                              onClick={() => navigateTo(`/receipt/${appointment._id}`)}
                            >
                              {appointment.payment.receiptNumber}
                            </button>
                          ) : appointment.hasVisited ? (
                            <button
                              className="action-btn primary"
                              disabled={busy}
                              onClick={() => {
                                setPaymentMethod("Cash");
                                setReceiptFor(appointment);
                              }}
                            >
                              Generate receipt
                            </button>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7}>No Appointments Found!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {receiptFor && (
        <div className="modal-backdrop" onClick={() => !busy && setReceiptFor(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="receipt-title">Collect consultation fee</h3>
            <dl>
              <dt>Patient</dt>
              <dd>{`${receiptFor.firstName} ${receiptFor.lastName}`}</dd>
              <dt>Doctor</dt>
              <dd>{`Dr. ${receiptFor.doctor.firstName} ${receiptFor.doctor.lastName} (${receiptFor.department})`}</dd>
              <dt>Appointment</dt>
              <dd>{`${formatDate(receiptFor.appointment_date)} ${formatSlot(receiptFor.appointment_time)}`}</dd>
              <dt>Consultation</dt>
              <dd>{formatMoney(receiptFor.consultationFee ?? 500)}</dd>
              {receiptFor.prescription?.items?.map((item) => (
                <React.Fragment key={item.code}>
                  <dt>{`${item.name} × ${item.quantity}`}</dt>
                  <dd>{formatMoney(item.price * item.quantity)}</dd>
                </React.Fragment>
              ))}
              <dt>Amount</dt>
              <dd className="amount">
                {formatMoney(
                  (receiptFor.consultationFee ?? 500) +
                    (receiptFor.prescription?.medicinesTotal || 0)
                )}
              </dd>
            </dl>
            <fieldset>
              <legend>Payment method</legend>
              {["Cash", "UPI", "Card"].map((m) => (
                <label key={m}>
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                  />
                  {m}
                </label>
              ))}
            </fieldset>
            <div className="modal-actions">
              <button className="action-btn" disabled={busy} onClick={() => setReceiptFor(null)}>
                Cancel
              </button>
              <button className="action-btn primary" disabled={busy} onClick={handleGenerateReceipt}>
                Confirm payment &amp; generate receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
