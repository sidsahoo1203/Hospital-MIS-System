import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { errorMessage, formatDate, formatDateTime, formatMoney, formatSlot } from "../utils";
import { useLiveUpdates } from "../live";

// Printable consultation-fee receipt
const Receipt = () => {
  const { id } = useParams();
  const navigateTo = useNavigate();
  const [appointment, setAppointment] = useState(null);

  const fetchAppointment = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/appointment/${id}`, {
        withCredentials: true,
      });
      setAppointment(data.appointment);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, [id]);
  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);
  useLiveUpdates(["appointments"], fetchAppointment);

  if (!appointment) return <section className="page receipt-page" />;

  const payment = appointment.payment || {};
  if (payment.status !== "Paid") {
    return (
      <section className="page receipt-page">
        <div className="receipt">
          <p>No receipt has been generated for this appointment yet.</p>
          <button className="action-btn" onClick={() => navigateTo("/")}>
            Back to appointments
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page receipt-page">
      <div className="receipt-actions no-print">
        <button className="action-btn" onClick={() => navigateTo(-1)}>
          ← Back
        </button>
        <button className="action-btn primary" onClick={() => window.print()}>
          Print receipt
        </button>
      </div>
      <article className="receipt" aria-label="Payment receipt">
        <header>
          <img src="/logo.png" alt="MediTrack" />
          <div>
            <h2>Payment Receipt</h2>
            <p>
              {appointment.prescription?.items?.length
                ? "Doctor consultation & medicines"
                : "Doctor consultation"}
            </p>
          </div>
        </header>
        <dl className="receipt-meta">
          <div>
            <dt>Receipt No.</dt>
            <dd>{payment.receiptNumber}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDateTime(payment.paidAt)}</dd>
          </div>
        </dl>
        <section>
          <h3>Patient</h3>
          <dl className="receipt-grid">
            <dt>Name</dt>
            <dd>{`${appointment.firstName} ${appointment.lastName}`}</dd>
            <dt>Phone</dt>
            <dd>{appointment.phone}</dd>
            <dt>Email</dt>
            <dd>{appointment.email}</dd>
            <dt>Address</dt>
            <dd>{appointment.address}</dd>
          </dl>
        </section>
        <section>
          <h3>Visit</h3>
          <dl className="receipt-grid">
            <dt>Doctor</dt>
            <dd>{`Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</dd>
            <dt>Department</dt>
            <dd>{appointment.department}</dd>
            <dt>Appointment date</dt>
            <dd>
              {formatDate(appointment.appointment_date)} {formatSlot(appointment.appointment_time)}
            </dd>
            <dt>Checked in</dt>
            <dd>{formatDateTime(appointment.visitedAt)}</dd>
          </dl>
        </section>
        {appointment.prescription?.notes && (
          <section>
            <h3>Doctor&apos;s notes</h3>
            <p className="receipt-notes">{appointment.prescription.notes}</p>
          </section>
        )}
        <table className="receipt-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Consultation fee — {appointment.department}</td>
              <td>{formatMoney(appointment.consultationFee ?? payment.amount)}</td>
            </tr>
            {appointment.prescription?.items?.map((item) => (
              <tr key={item.code}>
                <td>
                  {item.name} × {item.quantity}{" "}
                  <span className="unit">@ {formatMoney(item.price)}</span>
                </td>
                <td>{formatMoney(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total paid ({payment.method})</td>
              <td>{formatMoney(payment.amount)}</td>
            </tr>
          </tfoot>
        </table>
        <footer>
          <span className="paid-stamp">PAID</span>
          <p>This is a computer-generated receipt and does not need a signature.</p>
        </footer>
      </article>
    </section>
  );
};

export default Receipt;
