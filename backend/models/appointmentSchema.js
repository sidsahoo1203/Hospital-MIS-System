import mongoose from "mongoose";
import { Mongoose } from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name Is Required!"],
    minLength: [3, "First Name Must Contain At Least 3 Characters!"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name Is Required!"],
    minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Email Is Required!"],
    validate: [validator.isEmail, "Provide A Valid Email!"],
  },
  phone: {
    type: String,
    required: [true, "Phone Is Required!"],
    minLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
    maxLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
  },
  nic: {
    type: String,
    required: [true, "NIC Is Required!"],
    minLength: [12, "NIC Must Contain Only 12 Digits!"],
    maxLength: [12, "NIC Must Contain Only 12 Digits!"],
  },
  dob: {
    type: Date,
    required: [true, "DOB Is Required!"],
  },
  gender: {
    type: String,
    required: [true, "Gender Is Required!"],
    enum: ["Male", "Female"],
  },
  appointment_date: {
    type: String,
    required: [true, "Appointment Date Is Required!"],
  },
  // Slot start "HH:MM" (24h); see utils/slots.js
  appointment_time: {
    type: String,
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid appointment time!"],
  },
  department: {
    type: String,
    required: [true, "Department Name Is Required!"],
  },
  doctor: {
    firstName: {
      type: String,
      required: [true, "Doctor Name Is Required!"],
    },
    lastName: {
      type: String,
      required: [true, "Doctor Name Is Required!"],
    },
  },
  hasVisited: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    required: [true, "Address Is Required!"],
  },
  doctorId: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Doctor Id Is Invalid!"],
  },
  // Only set on appointments booked before patient accounts were removed
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  consultationFee: {
    type: Number,
    default: 500,
  },
  // Patient checked in at the hospital (marked by the admin)
  visitedAt: Date,
  // Doctor finished the consultation (marked by the doctor)
  consultationCompletedAt: Date,
  // Written by the doctor when completing the consultation
  prescription: {
    notes: String,
    items: [
      {
        _id: false,
        code: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    medicinesTotal: { type: Number, default: 0 },
    orderId: { type: mongoose.Schema.ObjectId, ref: "Order" },
  },
  payment: {
    status: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    method: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
    },
    amount: Number,
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    paidAt: Date,
  },
}, { timestamps: true });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
