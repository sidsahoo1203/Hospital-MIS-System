import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Context } from "../main";
import {
  ageFrom,
  errorMessage,
  formatDate,
  formatSlot,
  formatTime,
  queueOrder,
  todayISO,
} from "../utils";
import { LiveBadge, useLiveUpdates } from "../live";

const views = {
  Today: (a) => a.appointment_date.slice(0, 10) === todayISO(),
  Waiting: (a) => a.hasVisited && !a.consultationCompletedAt,
  Upcoming: (a) => a.appointment_date.slice(0, 10) > todayISO() && a.status !== "Rejected",
  Completed: (a) => !!a.consultationCompletedAt,
  All: () => true,
};

// Doctor's view of "done": consultation finished (or booking rejected)
const isFinished = (a) => a.status === "Rejected" || !!a.consultationCompletedAt;

// Doctor portal: the logged-in doctor's patients, check-in ("in") and
// consultation completion ("out")
const DoctorHome = () => {
  const { user } = useContext(Context);
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState("Today");
  const navigateTo = useNavigate();

  const fetchMine = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/appointment/mine", {
        withCredentials: true,
      });
      setAppointments(data.appointments);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    fetchMine();
  }, [fetchMine]);
  // e.g. the admin marks a patient as arrived on another PC
  useLiveUpdates(["appointments"], fetchMine);


  const stats = useMemo(
    () => ({
      today: appointments.filter(views.Today).filter((a) => a.status !== "Rejected").length,
      waiting: appointments.filter(views.Waiting).length,
      completed: appointments.filter(views.Completed).length,
    }),
    [appointments]
  );

  const visible = appointments.filter(views[view]).sort(queueOrder(isFinished));

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox doctor-greeting">
          <img
            src={user?.docAvatar?.url || "/doc.png"}
            alt="Doctor"
            className={user?.docAvatar?.url ? "doctor-photo" : ""}
          />
          <div className="content">
            <div>
              <p>Hello ,</p>
              <h5>{`Dr. ${user.firstName} ${user.lastName}`}</h5>
            </div>
            <p>
              {user.doctorDepartment} ·{" "}
              {stats.waiting > 0
                ? `${stats.waiting} patient(s) checked in and waiting for you.`
                : "No patients waiting right now."}
            </p>
          </div>
        </div>
        <div className="secondBox">
          <p>Today&apos;s Appointments</p>
          <h3>{stats.today}</h3>
        </div>
        <div className="thirdBox">
          <p>Consultations Done</p>
          <h3>{stats.completed}</h3>
        </div>
      </div>
      <div className="banner">
        <div className="table-header">
          <h5>
            My Patients <LiveBadge />
          </h5>
        </div>
        <div className="table-tools">
          <div className="filter-tabs" role="tablist" aria-label="Filter patients">
            {Object.keys(views).map((name) => (
              <button
                key={name}
                role="tab"
                aria-selected={view === name}
                className={view === name ? "active" : ""}
                onClick={() => setView(name)}
              >
                {name}
                {name === "Waiting" && stats.waiting > 0 && (
                  <span className="badge">{stats.waiting}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="table-scroll">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Date</th>
                <th>Status</th>
                <th>Checked in</th>
                <th>Consultation</th>
              </tr>
            </thead>
            <tbody>
              {visible.length > 0 ? (
                visible.map((a) => (
                  <tr key={a._id} className={isFinished(a) ? "finished" : ""}>
                    <td>
                      {`${a.firstName} ${a.lastName}`}
                      <small>{a.phone}</small>
                    </td>
                    <td>{`${ageFrom(a.dob)} / ${a.gender}`}</td>
                    <td>
                      {formatDate(a.appointment_date)}
                      <small>{formatSlot(a.appointment_time)}</small>
                    </td>
                    <td>
                      <span className={`value-${a.status.toLowerCase()}`}>{a.status}</span>
                    </td>
                    <td>
                      {a.hasVisited ? (
                        <span className="done">✓ {formatTime(a.visitedAt)}</span>
                      ) : (
                        <span className="muted">Not yet</span>
                      )}
                    </td>
                    <td>
                      {a.consultationCompletedAt ? (
                        <span className="done">
                          ✓ Done {formatTime(a.consultationCompletedAt)}
                          {a.payment?.status === "Paid" ? (
                            <button className="link-btn" onClick={() => navigateTo(`/receipt/${a._id}`)}>
                              {a.payment.receiptNumber}
                            </button>
                          ) : (
                            <small className="muted"> · pay at reception</small>
                          )}
                        </span>
                      ) : a.hasVisited ? (
                        <button
                          className="action-btn primary"
                          onClick={() => navigateTo(`/consultation/${a._id}`)}
                        >
                          Mark consultation done
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No patients in this list.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default DoctorHome;
