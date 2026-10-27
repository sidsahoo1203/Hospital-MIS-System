import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ageFrom, errorMessage, formatDate, formatMoney, formatSlot, formatTime } from "../utils";
import { useLiveUpdates } from "../live";
import { clearDraft, loadDraft, saveDraft } from "../prescriptionDraft";
import medicineImages from "../medicineImages.json";

// Doctor: finish a consultation — notes, dispense medicines from the hospital
// store, and (optionally) collect payment for fee + medicines right here.
const Consultation = () => {
  const { id } = useParams();
  const navigateTo = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  // Notes and medicines picked in the store page (code -> quantity)
  const [notes, setNotes] = useState(() => loadDraft(id).notes);
  const [cart, setCart] = useState(() => loadDraft(id).cart);
  const [payNow, setPayNow] = useState(true);
  const [method, setMethod] = useState("Cash");
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointment = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/appointment/${id}`, { withCredentials: true });
      setAppointment(data.appointment);
    } catch (error) {
      toast.error(errorMessage(error));
      navigateTo("/");
    }
  }, [id, navigateTo]);
  const fetchMedicines = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/medicines");
      setMedicines(data.medicines);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    fetchAppointment();
    fetchMedicines();
  }, [fetchAppointment, fetchMedicines]);
  // Stock changes from the online store or other doctors
  useLiveUpdates(["medicines"], fetchMedicines);

  useEffect(() => {
    saveDraft(id, { notes, cart });
  }, [id, notes, cart]);

  const byCode = useMemo(() => Object.fromEntries(medicines.map((m) => [m.code, m])), [medicines]);
  const lines = Object.entries(cart)
    .filter(([code]) => byCode[code])
    .map(([code, quantity]) => ({ ...byCode[code], quantity }));
  const medicinesTotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const fee = appointment?.consultationFee ?? 500;

  const setQuantity = (code, quantity) =>
    setCart((prev) => {
      const next = { ...prev };
      const max = byCode[code]?.stock ?? 0;
      const value = Math.min(Math.max(quantity, 0), max);
      if (value > 0) next[code] = value;
      else delete next[code];
      return next;
    });

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      const { data } = await axios.put(
        `/api/v1/appointment/complete/${id}`,
        {
          notes,
          items: lines.map(({ code, quantity }) => ({ code, quantity })),
          paymentMethod: payNow ? method : undefined,
        },
        { withCredentials: true }
      );
      clearDraft(id);
      toast.success(data.message);
      navigateTo(payNow ? `/receipt/${id}` : "/");
    } catch (error) {
      toast.error(errorMessage(error));
      fetchMedicines();
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointment) return <section className="page consultation" />;

  if (appointment.consultationCompletedAt) {
    return (
      <section className="page consultation">
        <div className="panel">
          <p>This consultation was completed at {formatTime(appointment.consultationCompletedAt)}.</p>
          <div className="modal-actions">
            <button className="action-btn" onClick={() => navigateTo("/")}>Back to my patients</button>
            {appointment.payment?.status === "Paid" && (
              <button className="action-btn primary" onClick={() => navigateTo(`/receipt/${id}`)}>
                View receipt
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page consultation">
      <div className="consultation-head">
        <button className="action-btn" onClick={() => navigateTo("/")}>← My patients</button>
        <h1>Consultation</h1>
      </div>

      <div className="consultation-grid">
        <div className="panel">
          <h2>{`${appointment.firstName} ${appointment.lastName}`}</h2>
          <dl className="facts">
            <dt>Age / Gender</dt>
            <dd>{`${ageFrom(appointment.dob)} / ${appointment.gender}`}</dd>
            <dt>Phone</dt>
            <dd>{appointment.phone}</dd>
            <dt>Appointment</dt>
            <dd>
              {formatDate(appointment.appointment_date)} {formatSlot(appointment.appointment_time)} ·{" "}
              {appointment.department}
            </dd>
            <dt>Checked in</dt>
            <dd>{formatTime(appointment.visitedAt)}</dd>
          </dl>

          <label className="field">
            <span>Notes / advice (printed on the receipt)</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Viral fever. Rest for 3 days, plenty of fluids. Review if fever persists."
            />
          </label>

          <div className="field">
            <div className="rx-head">
              <span>Prescribed medicines</span>
              <button
                className="action-btn primary"
                onClick={() => navigateTo(`/consultation/${id}/medicines`)}
              >
                {lines.length ? "Add / change in medicine store" : "Browse medicine store"}
              </button>
            </div>
            {lines.length === 0 ? (
              <p className="muted rx-empty">
                None yet. Open the medicine store to pick medicines for this patient.
              </p>
            ) : (
              <ul className="rx-picked">
                {lines.map((l) => (
                  <li key={l.code}>
                    <img src={medicineImages[l.code]} alt="" />
                    <div>
                      <b>{l.name}</b>
                      <small>
                        {l.quantity} × {formatMoney(l.price)} · {l.category}
                      </small>
                    </div>
                    <span className="num">{formatMoney(l.price * l.quantity)}</span>
                    <button
                      className="link-btn"
                      aria-label={`Remove ${l.name}`}
                      onClick={() => setQuantity(l.code, 0)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="panel bill">
          <h2>Bill</h2>
          <table className="bill-lines">
            <tbody>
              <tr>
                <td>Consultation fee</td>
                <td />
                <td className="num">{formatMoney(fee)}</td>
              </tr>
              {lines.map((l) => (
                <tr key={l.code}>
                  <td>
                    {l.name}
                    <small>{formatMoney(l.price)} each · {l.stock} in stock</small>
                  </td>
                  <td>
                    <div className="qty">
                      <button aria-label={`Fewer ${l.name}`} onClick={() => setQuantity(l.code, l.quantity - 1)}>−</button>
                      <input
                        type="number"
                        min="0"
                        max={l.stock}
                        value={l.quantity}
                        aria-label={`Quantity of ${l.name}`}
                        onChange={(e) => setQuantity(l.code, Number(e.target.value))}
                      />
                      <button
                        aria-label={`More ${l.name}`}
                        disabled={l.quantity >= l.stock}
                        onClick={() => setQuantity(l.code, l.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="num">{formatMoney(l.price * l.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>Total</td>
                <td className="num">{formatMoney(fee + medicinesTotal)}</td>
              </tr>
            </tfoot>
          </table>
          {lines.length === 0 && <p className="muted">No medicines prescribed (consultation fee only).</p>}

          <fieldset className="pay-options">
            <legend>Payment</legend>
            <label>
              <input type="radio" name="pay" checked={payNow} onChange={() => setPayNow(true)} />
              Collect now
            </label>
            {payNow && (
              <div className="methods">
                {["Cash", "UPI", "Card"].map((m) => (
                  <label key={m}>
                    <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} />
                    {m}
                  </label>
                ))}
              </div>
            )}
            <label>
              <input type="radio" name="pay" checked={!payNow} onChange={() => setPayNow(false)} />
              Patient pays at reception
            </label>
          </fieldset>

          <button className="action-btn primary big" disabled={submitting} onClick={handleComplete}>
            {submitting
              ? "Saving…"
              : payNow
              ? `Complete & collect ${formatMoney(fee + medicinesTotal)}`
              : "Complete consultation"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Consultation;
