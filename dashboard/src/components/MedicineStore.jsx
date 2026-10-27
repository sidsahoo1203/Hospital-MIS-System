import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { errorMessage, formatDateTime, formatMoney } from "../utils";
import { LiveBadge, useLiveUpdates } from "../live";

const LOW_STOCK = 10;

// Spreadsheet download that Excel opens directly (UTF-8 BOM keeps ₹ intact)
const downloadCsv = (filename, header, rows) => {
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
};

const itemsText = (items) => items.map((i) => `${i.name} × ${i.quantity}`).join(", ");

const MedicineStore = () => {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("Inventory");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [restock, setRestock] = useState({});
  const [busy, setBusy] = useState(false);

  const fetchMedicines = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/medicines");
      setMedicines(data.medicines);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);
  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/medicines/orders/all", {
        withCredentials: true,
      });
      setOrders(data.orders);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    fetchMedicines();
    fetchOrders();
  }, [fetchMedicines, fetchOrders]);
  useLiveUpdates(["medicines"], fetchMedicines);
  useLiveUpdates(["orders"], fetchOrders);

  const stats = useMemo(
    () => ({
      types: medicines.length,
      inStock: medicines.reduce((sum, m) => sum + m.stock, 0),
      sold: medicines.reduce((sum, m) => sum + m.sold, 0),
      low: medicines.filter((m) => m.stock > 0 && m.stock <= LOW_STOCK).length,
      out: medicines.filter((m) => m.stock === 0).length,
      revenue: orders
        .filter((o) => o.paymentStatus === "Paid")
        .reduce((sum, o) => sum + o.total, 0),
      pending: orders.filter((o) => o.paymentStatus === "Pending").length,
    }),
    [medicines, orders]
  );

  const q = search.trim().toLowerCase();
  const visibleMedicines = medicines.filter(
    (m) =>
      (stockFilter === "All" ||
        (stockFilter === "Low" && m.stock > 0 && m.stock <= LOW_STOCK) ||
        (stockFilter === "Out" && m.stock === 0)) &&
      (!q || `${m.name} ${m.category}`.toLowerCase().includes(q))
  );
  const visibleOrders = orders.filter(
    (o) =>
      !q ||
      [o.orderNumber, o.customer.name, o.customer.phone, o.customer.email, o.doctorName, itemsText(o.items)]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
  );

  const handleRestock = async (medicine) => {
    const quantity = Number(restock[medicine.code]);
    if (!quantity) return;
    setBusy(true);
    try {
      const { data } = await axios.put(
        `/api/v1/medicines/${medicine.code}/stock`,
        { quantity },
        { withCredentials: true }
      );
      setMedicines((prev) => prev.map((m) => (m.code === medicine.code ? data.medicine : m)));
      setRestock((prev) => ({ ...prev, [medicine.code]: "" }));
      toast.success(data.message);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async (order) => {
    setBusy(true);
    try {
      const { data } = await axios.put(
        `/api/v1/medicines/orders/${order._id}/paid`,
        {},
        { withCredentials: true }
      );
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data.order : o)));
      toast.success(data.message);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const exportOrders = () =>
    downloadCsv(
      `medicine-orders-${new Date().toLocaleDateString("en-CA")}.csv`,
      ["Order No", "Date", "Source", "Doctor", "Customer", "Phone", "Email", "Address",
        "Items", "Units", "Subtotal (INR)", "Delivery (INR)", "Discount (INR)", "Total (INR)",
        "Payment Method", "Payment Status"],
      visibleOrders.map((o) => [
        o.orderNumber, formatDateTime(o.createdAt), o.source, o.doctorName, o.customer.name,
        o.customer.phone, o.customer.email, o.customer.address, itemsText(o.items),
        o.items.reduce((n, i) => n + i.quantity, 0), o.subtotal, o.deliveryFee, o.discount,
        o.total, o.paymentMethod, o.paymentStatus,
      ])
    );

  const exportInventory = () =>
    downloadCsv(
      `medicine-inventory-${new Date().toLocaleDateString("en-CA")}.csv`,
      ["Medicine", "Category", "Price (INR)", "In Stock", "Sold"],
      visibleMedicines.map((m) => [m.name, m.category, m.price, m.stock, m.sold])
    );

  return (
    <section className="page medicine-store">
      <h1>
        MEDICINE STORE <LiveBadge />
      </h1>

      <div className="store-stats">
        <div><p>Medicines</p><h3>{stats.types}</h3></div>
        <div><p>Units in stock</p><h3>{stats.inStock.toLocaleString("en-IN")}</h3></div>
        <div><p>Units sold</p><h3>{stats.sold.toLocaleString("en-IN")}</h3></div>
        <div><p>Low / out of stock</p><h3>{stats.low} / {stats.out}</h3></div>
        <div><p>Collected</p><h3>{formatMoney(stats.revenue)}</h3></div>
      </div>

      <div className="store-panel">
        <div className="table-tools">
          <div className="filter-tabs" role="tablist" aria-label="Medicine store views">
            {["Inventory", "Orders"].map((name) => (
              <button
                key={name}
                role="tab"
                aria-selected={tab === name}
                className={tab === name ? "active" : ""}
                onClick={() => setTab(name)}
              >
                {name === "Orders" ? `Orders (${orders.length})` : name}
                {name === "Orders" && stats.pending > 0 && (
                  <span className="badge" title="Awaiting payment">{stats.pending}</span>
                )}
              </button>
            ))}
            {tab === "Inventory" &&
              ["All", "Low", "Out"].map((name) => (
                <button
                  key={name}
                  className={`sub ${stockFilter === name ? "active" : ""}`}
                  onClick={() => setStockFilter(name)}
                >
                  {name === "All" ? "All stock" : name === "Low" ? `Low (≤${LOW_STOCK})` : "Out of stock"}
                </button>
              ))}
          </div>
          <div className="tools-right">
            <input
              type="search"
              className="table-search"
              placeholder={tab === "Inventory" ? "Search medicine or category…" : "Search order, buyer, phone, medicine…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="action-btn"
              onClick={tab === "Inventory" ? exportInventory : exportOrders}
            >
              Download Excel (CSV)
            </button>
          </div>
        </div>

        <div className="table-scroll">
          {tab === "Inventory" ? (
            <table className="sheet">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th className="num">Price</th>
                  <th className="num">In stock</th>
                  <th className="num">Sold</th>
                  <th>Add stock</th>
                </tr>
              </thead>
              <tbody>
                {visibleMedicines.map((m) => (
                  <tr key={m.code}>
                    <td>{m.name}</td>
                    <td>{m.category}</td>
                    <td className="num">{formatMoney(m.price)}</td>
                    <td className={`num ${m.stock === 0 ? "out" : m.stock <= LOW_STOCK ? "low" : ""}`}>
                      {m.stock}
                    </td>
                    <td className="num">{m.sold}</td>
                    <td>
                      <form
                        className="restock"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleRestock(m);
                        }}
                      >
                        <input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Units"
                          aria-label={`Units of ${m.name} to add`}
                          value={restock[m.code] ?? ""}
                          onChange={(e) => setRestock((prev) => ({ ...prev, [m.code]: e.target.value }))}
                        />
                        <button className="action-btn" disabled={busy || !restock[m.code]}>
                          Add
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {visibleMedicines.length === 0 && (
                  <tr>
                    <td colSpan={6}>No medicines match.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="sheet">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Buyer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Items</th>
                  <th className="num">Total</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="mono">{o.orderNumber}</td>
                    <td>{formatDateTime(o.createdAt)}</td>
                    <td>
                      {o.source === "Store" ? "Online store" : "Prescription"}
                      {o.doctorName && <small>{o.doctorName}</small>}
                    </td>
                    <td>
                      {o.customer.name}
                      <small>{o.customer.email}</small>
                    </td>
                    <td>{o.customer.phone}</td>
                    <td className="wrap">{o.customer.address}</td>
                    <td className="wrap">{itemsText(o.items)}</td>
                    <td className="num">
                      {formatMoney(o.total)}
                      {o.discount > 0 && <small>incl. −{formatMoney(o.discount)} ({o.promoCode})</small>}
                    </td>
                    <td>
                      {o.paymentStatus === "Paid" ? (
                        <span className="done">✓ Paid{o.paymentMethod ? ` · ${o.paymentMethod}` : ""}</span>
                      ) : o.source === "Store" ? (
                        <>
                          <span className="waiting">Cash on delivery</span>
                          <button className="link-btn" disabled={busy} onClick={() => handleMarkPaid(o)}>
                            Mark paid
                          </button>
                        </>
                      ) : (
                        <span className="waiting">With visit receipt</span>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleOrders.length === 0 && (
                  <tr>
                    <td colSpan={9}>No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

export default MedicineStore;
