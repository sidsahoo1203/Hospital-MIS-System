import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { MdPerson, MdEmail, MdPhone, MdCalendarToday, MdLocationOn, MdMedicalServices, MdAccessTime } from "react-icons/md";

const AppointmentForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  // Time slots of the chosen doctor on the chosen date
  const [slots, setSlots] = useState({ loading: false, closed: false, list: [] });
  const [address, setAddress] = useState("");
  const [consultationFee, setConsultationFee] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  const departmentsArray = [
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

  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await axios.get(
        "/api/v1/user/doctors",
        { withCredentials: true }
      );
      setDoctors(data.doctors);
    };
    const fetchFee = async () => {
      const { data } = await axios.get("/api/v1/appointment/fee");
      setConsultationFee(data.consultationFee);
    };
    fetchDoctors();
    fetchFee();
  }, []);

  useEffect(() => {
    setAppointmentTime("");
    if (!doctorId || !appointmentDate) {
      setSlots({ loading: false, closed: false, list: [] });
      return;
    }
    let cancelled = false;
    setSlots((prev) => ({ ...prev, loading: true }));
    axios
      .get("/api/v1/appointment/slots", { params: { doctorId, date: appointmentDate } })
      .then(({ data }) => {
        if (!cancelled) setSlots({ loading: false, closed: data.closed, list: data.slots });
      })
      .catch(() => {
        if (!cancelled) setSlots({ loading: false, closed: false, list: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId, appointmentDate]);

  const freeSlots = slots.list.filter((slot) => slot.available);
  const timePlaceholder = !doctorId || !appointmentDate
    ? "Select doctor & date first"
    : slots.loading
    ? "Loading times…"
    : slots.closed
    ? "Closed on Sundays"
    : freeSlots.length === 0
    ? "No free times this day"
    : "Select Time";

  const handleAppointment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "/api/v1/appointment/post",
        {
          firstName,
          lastName,
          email,
          phone,
          nic,
          dob,
          gender,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          department,
          doctorId,
          address,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(data.message);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNic("");
      setDob("");
      setGender("");
      setAppointmentDate("");
      setDepartment("Pediatrics");
      setDoctorId("");
      setAppointmentTime("");
      setAddress("");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleAppointment} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdPerson className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            />
          </div>

          {/* Last Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdPerson className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdEmail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdPhone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              required
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            />
          </div>

          {/* NIC */}
          <div className="relative">
            <input
              type="number"
              required
              placeholder="NIC"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            />
          </div>

          {/* DOB */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdCalendarToday className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              required
              placeholder="Date of Birth"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            />
          </div>

          {/* Gender */}
          <div className="relative">
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Appointment Date */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdCalendarToday className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              required
              min={today}
              placeholder="Appointment Date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            />
          </div>

          {/* Department */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdMedicalServices className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setDoctorId("");
              }}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
            >
              {departmentsArray.map((depart, index) => (
                <option value={depart} key={index}>
                  {depart}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdPerson className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={!department}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white disabled:bg-gray-100"
            >
              <option value="">Select Doctor</option>
              {doctors
                .filter((doctor) => doctor.doctorDepartment === department)
                .map((doctor) => (
                  <option value={doctor._id} key={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
            </select>
          </div>

          {/* Time slot */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdAccessTime className="h-5 w-5 text-gray-400" />
            </div>
            <select
              required
              aria-label="Appointment time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              disabled={freeSlots.length === 0}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white disabled:bg-gray-100"
            >
              <option value="">{timePlaceholder}</option>
              {slots.list.map((slot) => (
                <option key={slot.time} value={slot.time} disabled={!slot.available}>
                  {slot.label}{slot.available ? "" : " — not available"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="relative">
          <div className="absolute top-3 left-3">
            <MdLocationOn className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            rows="4"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2f3d7e]/20 focus:border-[#2f3d7e] transition-colors bg-white"
          />
        </div>

        {/* Consultation fee */}
        {consultationFee !== null && (
          <div className="flex items-center justify-between rounded-lg border border-[#2f3d7e]/20 bg-[#2f3d7e]/5 px-4 py-3 text-gray-700">
            <span>Consultation fee (same for every doctor)</span>
            <span className="font-semibold text-[#2f3d7e]">
              ₹{consultationFee} · pay at the hospital
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#2f3d7e] text-white rounded-lg hover:bg-[#1f2b5e] transition-colors duration-200 font-medium"
        >
          GET APPOINTMENT
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
