import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ageFrom, DEPARTMENTS, errorMessage } from "../utils";
import { LiveBadge, useLiveUpdates } from "../live";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [department, setDepartment] = useState("All");
  const [search, setSearch] = useState("");

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/user/doctors", {
        withCredentials: true,
      });
      setDoctors(data.doctors);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }, []);
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);
  useLiveUpdates(["doctors"], fetchDoctors);

  // Adds or replaces a doctor's photo (photos are optional when adding a doctor)
  const handlePhoto = async (doctor, file) => {
    if (!file) return;
    setUploadingId(doctor._id);
    try {
      const formData = new FormData();
      formData.append("docAvatar", file);
      const { data } = await axios.put(`/api/v1/user/doctor/${doctor._id}/photo`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDoctors((prev) => prev.map((d) => (d._id === doctor._id ? data.doctor : d)));
      toast.success(data.message);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setUploadingId(null);
    }
  };

  // Doctors per department (departments with no doctor yet show 0)
  const counts = useMemo(() => {
    const byDept = Object.fromEntries(DEPARTMENTS.map((name) => [name, 0]));
    for (const d of doctors) byDept[d.doctorDepartment] = (byDept[d.doctorDepartment] || 0) + 1;
    return byDept;
  }, [doctors]);

  const q = search.trim().toLowerCase();
  const visible = doctors
    .filter((d) => department === "All" || d.doctorDepartment === department)
    .filter(
      (d) =>
        !q ||
        [`${d.firstName} ${d.lastName}`, d.email, d.phone].some((v) => v.toLowerCase().includes(q))
    )
    .sort(
      (a, b) =>
        a.doctorDepartment.localeCompare(b.doctorDepartment) ||
        a.firstName.localeCompare(b.firstName)
    );

  return (
    <section className="page doctors">
      <h1>
        DOCTORS ({doctors.length}) <LiveBadge />
      </h1>
      <div className="doctors-tools">
        <div className="filter-tabs" role="tablist" aria-label="Departments">
          {["All", ...Object.keys(counts)].map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={department === name}
              className={department === name ? "active" : ""}
              onClick={() => setDepartment(name)}
            >
              {name} <span className="count">{name === "All" ? doctors.length : counts[name]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          className="table-search"
          placeholder="Search name, login ID, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="doctor-grid">
        {visible.length > 0 ? (
          visible.map((doctor) => (
            <article className="doctor-card" key={doctor._id}>
              <img src={doctor.docAvatar?.url || "/docHolder.jpg"} alt="" />
              <div className="doctor-info">
                <h4>{`Dr. ${doctor.firstName} ${doctor.lastName}`}</h4>
                <span className="dept-badge">{doctor.doctorDepartment}</span>
                <dl>
                  <dt>Login ID</dt>
                  <dd title={doctor.email}>{doctor.email}</dd>
                  <dt>Phone</dt>
                  <dd>{doctor.phone}</dd>
                  <dt>Age</dt>
                  <dd>{`${ageFrom(doctor.dob)} · ${doctor.gender}`}</dd>
                </dl>
              </div>
              <label className="photo-btn" title="Choose a JPG, PNG or WEBP image">
                {uploadingId === doctor._id
                  ? "Uploading…"
                  : doctor.docAvatar?.url
                  ? "Change photo"
                  : "Add photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploadingId === doctor._id}
                  onChange={(e) => {
                    handlePhoto(doctor, e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </article>
          ))
        ) : (
          <p className="muted">
            {doctors.length === 0
              ? "No registered doctors yet."
              : department !== "All" && counts[department] === 0
              ? `No doctors in ${department} yet.`
              : "No doctors match your search."}
          </p>
        )}
      </div>
    </section>
  );
};

export default Doctors;
