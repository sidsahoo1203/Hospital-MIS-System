import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { errorMessage, formatMoney } from "../utils";
import { useLiveUpdates } from "../live";
import { loadDraft, saveDraft } from "../prescriptionDraft";
import medicineImages from "../medicineImages.json";

// Doctor: browse the hospital medicine store and pick medicines for the
// patient of one consultation. The picks go back to the consultation page.
const PrescriptionStore = () => {
  const { id } = useParams();
  const navigateTo = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(() => loadDraft(id));
  const cart = draft.cart;

  const fetchAppointment = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/appointment/${id}`, { withCredentials: true });
      if (data.appointment.consultationCompletedAt) {
        toast.info("This consultation is already completed.");
        navigateTo(`/consultation/${id}`);
        return;
      }
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
  useLiveUpdates(["medicines"], fetchMedicines);

  useEffect(() => {
    saveDraft(id, draft);
  }, [id, draft]);

  const byCode = useMemo(() => Object.fromEntries(medicines.map((m) => [m.code, m])), [medicines]);
  const categories = useMemo(
    () => ["All", ...new Set(medicines.map((m) => m.category))],
    [medicines]
  );

  const setQuantity = (code, quantity) =>
    setDraft((prev) => {
      const next = { ...prev.cart };
      const value = Math.min(Math.max(quantity, 0), byCode[code]?.stock ?? 0);
      if (value > 0) next[code] = value;
      else delete next[code];
      return { ...prev, cart: next };
    });

  const q = search.trim().toLowerCase();
  const visible = medicines.filter(
    (m) =>
      (category === "All" || m.category === category) &&
      (!q || `${m.name} ${m.category} ${m.description || ""}`.toLowerCase().includes(q))
  );
  const picked = Object.entries(cart).filter(([code]) => byCode[code]);
  const units = picked.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = picked.reduce((sum, [code, quantity]) => sum + byCode[code].price * quantity, 0);

  return (
    <section className="page rx-store">
      <div className="consultation-head">
        <button className="action-btn" onClick={() => navigateTo(`/consultation/${id}`)}>
          ← Consultation
        </button>
        <div>
          <h1>Medicine Store</h1>
          {appointment && (
            <p className="muted">
              Prescribing for <b>{`${appointment.firstName} ${appointment.lastName}`}</b>
            </p>
          )}
        </div>
      </div>

      <div className="rx-tools">
        <div className="filter-tabs" role="tablist" aria-label="Medicine categories">
          {categories.map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={category === name}
              className={category === name ? "active" : ""}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="table-search"
          placeholder="Search medicines…"
          aria-label="Search medicines"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rx-grid">
        {visible.map((m) => {
          const quantity = cart[m.code] || 0;
          const outOfStock = m.stock === 0;
          return (
            <article key={m.code} className={`rx-card ${quantity ? "picked" : ""}`}>
              <img
                src={medicineImages[m.code]}
                alt={m.name}
                loading="lazy"
                className={outOfStock ? "dim" : ""}
              />
              <div className="rx-card-body">
                <h3>{m.name}</h3>
                <p className="muted">{m.category}</p>
                {m.description && <p className="rx-desc">{m.description}</p>}
                <div className="rx-card-foot">
                  <div>
                    <b>{formatMoney(m.price)}</b>
                    <small className={outOfStock ? "out" : m.stock <= 10 ? "low" : ""}>
                      {outOfStock ? "Out of stock" : `${m.stock} in stock`}
                    </small>
                  </div>
                  {quantity === 0 ? (
                    <button
                      className="action-btn primary"
                      disabled={outOfStock}
                      onClick={() => setQuantity(m.code, 1)}
                    >
                      Add
                    </button>
                  ) : (
                    <div className="qty">
                      <button aria-label={`Fewer ${m.name}`} onClick={() => setQuantity(m.code, quantity - 1)}>
                        −
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        aria-label={`More ${m.name}`}
                        disabled={quantity >= m.stock}
                        onClick={() => setQuantity(m.code, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {medicines.length > 0 && visible.length === 0 && (
          <p className="muted">No medicines match your search.</p>
        )}
      </div>

      <div className="rx-bar" role="region" aria-label="Selected medicines">
        <span>
          {picked.length === 0
            ? "No medicines selected yet"
            : `${picked.length} medicine${picked.length > 1 ? "s" : ""} · ${units} unit${units > 1 ? "s" : ""} · ${formatMoney(total)}`}
        </span>
        <button className="action-btn primary big" onClick={() => navigateTo(`/consultation/${id}`)}>
          Done — back to consultation
        </button>
      </div>
    </section>
  );
};

export default PrescriptionStore;
