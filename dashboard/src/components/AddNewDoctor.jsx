import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { DEPARTMENTS, errorMessage } from "../utils";
import { useLiveUpdates } from "../live";

// Readable temporary password, e.g. "Kx7m-Qp42-Vt9a"
const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const random = crypto.getRandomValues(new Uint32Array(12));
  const s = Array.from(random, (n) => chars[n % chars.length]).join("");
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  doctorDepartment: "",
  gender: "",
  phone: "",
  dob: "",
  nic: "",
  email: "",
  password: "",
};

const AddNewDoctor = () => {
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null); // { file, preview }
  const [submitting, setSubmitting] = useState(false);
  // Login details of the doctor just created, shown once to hand over
  const [credentials, setCredentials] = useState(null);

  // Remove-a-doctor section
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [toRemove, setToRemove] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [removing, setRemoving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/user/doctors", { withCredentials: true });
      setDoctors(data.doctors);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);
  useLiveUpdates(["doctors"], fetchDoctors);

  const field = (name) => ({
    name,
    value: form[name],
    onChange: (e) => setForm((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto({ file, preview: URL.createObjectURL(file) });
  };

  const handleAddNewDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (photo) formData.append("docAvatar", photo.file);
      const { data } = await axios.post("/api/v1/user/doctor/addnew", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message);
      setCredentials({
        name: `Dr. ${form.firstName} ${form.lastName}`,
        department: form.doctorDepartment,
        email: form.email,
        password: form.password,
      });
      setForm(emptyForm);
      setPhoto(null);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const copyCredentials = async () => {
    const text = `MediTrack doctor login\nLogin ID: ${credentials.email}\nPassword: ${credentials.password}\nPlease change your password after your first login.`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Login details copied.");
    } catch {
      toast.error("Couldn't copy; please note the details manually.");
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    setRemoving(true);
    try {
      const { data } = await axios.delete(`/api/v1/user/doctor/${toRemove._id}`, {
        withCredentials: true,
        data: { adminPassword },
      });
      toast.success(data.message);
      if (credentials?.email === toRemove.email) setCredentials(null);
      setToRemove(null);
      setSearch("");
      setDoctors((prev) => prev.filter((d) => d._id !== toRemove._id));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAdminPassword("");
      setRemoving(false);
    }
  };

  const q = search.trim().toLowerCase();
  const matches = q
    ? doctors
        .filter((d) =>
          [`${d.firstName} ${d.lastName}`, d.doctorDepartment, d.email].some((v) =>
            v.toLowerCase().includes(q)
          )
        )
        .slice(0, 6)
    : [];

  return (
    <section className="page add-doctor">
      <h1>ADD A DOCTOR</h1>

      {credentials && (
        <div className="credentials-card" role="status">
          <p>
            <b>{credentials.name}</b> ({credentials.department}) is registered. Give them these
            login details; they log in as <b>Doctor</b> and can change the password.
          </p>
          <dl>
            <dt>Login ID</dt>
            <dd>{credentials.email}</dd>
            <dt>Password</dt>
            <dd>
              <code>{credentials.password}</code>
            </dd>
          </dl>
          <div className="modal-actions">
            <span className="muted">This password is shown only once.</span>
            <button className="action-btn" onClick={copyCredentials}>
              Copy login details
            </button>
            <button className="action-btn primary" onClick={() => setCredentials(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      <form className="panel doctor-form" onSubmit={handleAddNewDoctor}>
        <label className="photo-picker" title="Optional: JPG, PNG or WEBP">
          <img src={photo?.preview || "/docHolder.jpg"} alt="" />
          <span>{photo ? "Change photo" : "+ Add photo"}</span>
          <small className="muted">Optional, can be added later</small>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhoto} />
        </label>

        <div className="form-grid">
          <label>
            First name
            <input required minLength={3} {...field("firstName")} placeholder="e.g. Asha" />
          </label>
          <label>
            Last name
            <input required minLength={3} {...field("lastName")} placeholder="e.g. Verma" />
          </label>
          <label>
            Department
            <select required {...field("doctorDepartment")}>
              <option value="">Select…</option>
              {DEPARTMENTS.map((depart) => (
                <option value={depart} key={depart}>
                  {depart}
                </option>
              ))}
            </select>
          </label>
          <label>
            Gender
            <select required {...field("gender")}>
              <option value="">Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
          <label>
            Mobile number
            <input
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              title="10-digit mobile number"
              {...field("phone")}
              placeholder="10 digits"
            />
          </label>
          <label>
            Date of birth
            <input required type="date" {...field("dob")} />
          </label>
          <label>
            NIC / ID number
            <input
              required
              inputMode="numeric"
              pattern="[0-9]{12}"
              title="12-digit ID number"
              {...field("nic")}
              placeholder="12 digits"
            />
          </label>
          <label>
            Login ID (email)
            <input required type="email" {...field("email")} placeholder="name@hospital.com" />
          </label>
          <label className="span-2">
            Login password
            <div className="password-row">
              <input
                required
                minLength={8}
                autoComplete="new-password"
                {...field("password")}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className="action-btn"
                onClick={() => setForm((prev) => ({ ...prev, password: generatePassword() }))}
              >
                Generate
              </button>
            </div>
          </label>
          <button type="submit" className="action-btn primary big span-2" disabled={submitting}>
            {submitting ? "Registering…" : "Register doctor"}
          </button>
        </div>
      </form>

      <section className="panel remove-doctor-panel" aria-labelledby="remove-doctor-title">
        <h2 id="remove-doctor-title">Remove a doctor</h2>
        <p className="muted">
          Search by name, department or login ID. Removing needs the admin password; the doctor's
          open appointments are cancelled, visited and paid ones are kept.
        </p>
        {!toRemove ? (
          <>
            <input
              type="search"
              className="table-search"
              placeholder="Search doctor to remove…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {q && (
              <ul className="doctor-results">
                {matches.map((d) => (
                  <li key={d._id}>
                    <img src={d.docAvatar?.url || "/docHolder.jpg"} alt="" />
                    <div>
                      <b>{`Dr. ${d.firstName} ${d.lastName}`}</b>
                      <small>
                        {d.doctorDepartment} · {d.email}
                      </small>
                    </div>
                    <button className="action-btn" onClick={() => setToRemove(d)}>
                      Select
                    </button>
                  </li>
                ))}
                {matches.length === 0 && <li className="muted">No doctor matches “{search}”.</li>}
              </ul>
            )}
          </>
        ) : (
          <form className="confirm-remove" onSubmit={handleRemove}>
            <ul className="doctor-results">
              <li>
                <img src={toRemove.docAvatar?.url || "/docHolder.jpg"} alt="" />
                <div>
                  <b>{`Dr. ${toRemove.firstName} ${toRemove.lastName}`}</b>
                  <small>
                    {toRemove.doctorDepartment} · {toRemove.email}
                  </small>
                </div>
              </li>
            </ul>
            <label>
              Admin password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter the admin password to confirm"
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  setToRemove(null);
                  setAdminPassword("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="danger-btn" disabled={removing}>
                {removing ? "Removing…" : `Remove Dr. ${toRemove.firstName} ${toRemove.lastName}`}
              </button>
            </div>
          </form>
        )}
      </section>
    </section>
  );
};

export default AddNewDoctor;
