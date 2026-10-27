import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { Order } from "../models/orderSchema.js";
import { consultationFee } from "../utils/fees.js";
import { broadcast } from "../utils/events.js";
import { nextNumber } from "../utils/numbering.js";
import { linesTotal, returnStock, takeStock } from "../utils/stock.js";
import { isClosed, nowLocal, slotsFor, timeLabel } from "../utils/slots.js";

// Times already taken with a doctor on a date (rejected bookings free the slot)
const takenTimes = async (doctorId, date) =>
  (
    await Appointment.find(
      { doctorId, appointment_date: date, status: { $ne: "Rejected" } },
      { appointment_time: 1 }
    ).lean()
  )
    .map((a) => a.appointment_time)
    .filter(Boolean);

// Public: bookable slots for a doctor on a date
export const getSlots = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
    return next(new ErrorHandler("Choose a doctor and a date.", 400));
  }
  const now = nowLocal();
  const taken = new Set(await takenTimes(doctorId, date));
  const slots = slotsFor(date).map((time) => ({
    time,
    label: timeLabel(time),
    available: !taken.has(time) && !(date === now.date && time <= now.time),
  }));
  res.status(200).json({ success: true, closed: isClosed(date), slots });
});

const PAYMENT_METHODS = ["Cash", "UPI", "Card"];

// Takes payment for the visit (consultation fee + prescribed medicines) and
// gives the appointment a receipt number. Caller saves the appointment.
const issueReceipt = async (appointment, method) => {
  const fee = appointment.consultationFee ?? consultationFee();
  appointment.payment = {
    status: "Paid",
    method,
    amount: fee + (appointment.prescription?.medicinesTotal || 0),
    receiptNumber: await nextNumber(Appointment, "payment.receiptNumber", "MT"),
    paidAt: new Date(),
  };
  if (appointment.prescription?.orderId) {
    await Order.updateOne(
      { _id: appointment.prescription.orderId },
      { $set: { paymentStatus: "Paid", paymentMethod: method } }
    );
  }
};

export const getConsultationFee = (req, res) => {
  res.status(200).json({ success: true, consultationFee: consultationFee() });
};

// Public: patients book without an account
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    appointment_time,
    department,
    doctorId,
    address,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !appointment_time ||
    !department ||
    !doctorId ||
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const date = String(appointment_date).slice(0, 10);
  const now = nowLocal();
  if (date < now.date || (date === now.date && appointment_time <= now.time)) {
    return next(new ErrorHandler("Appointment time cannot be in the past!", 400));
  }
  if (isClosed(date)) {
    return next(new ErrorHandler("The hospital is closed on Sundays. Please pick another day.", 400));
  }
  if (!slotsFor(date).includes(appointment_time)) {
    return next(new ErrorHandler("Please pick one of the listed time slots.", 400));
  }
  const doctor = await User.findOne({
    _id: doctorId,
    role: "Doctor",
    doctorDepartment: department,
  });
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found in this department!", 404));
  }
  if ((await takenTimes(doctor._id, date)).includes(appointment_time)) {
    return next(
      new ErrorHandler(
        `Dr. ${doctor.firstName} ${doctor.lastName} is already booked at ${timeLabel(appointment_time)} on that day. Please pick another time.`,
        409
      )
    );
  }
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date: date,
    appointment_time,
    department,
    doctor: {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
    },
    address,
    doctorId: doctor._id,
    consultationFee: consultationFee(),
  });
  broadcast("appointments");
  res.status(200).json({
    success: true,
    appointment,
    message: `Appointment requested with Dr. ${doctor.firstName} ${doctor.lastName} at ${timeLabel(appointment_time)}. Consultation fee ₹${appointment.consultationFee}, payable at the hospital.`,
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find().sort({ appointment_date: 1, appointment_time: 1 });
  res.status(200).json({
    success: true,
    appointments,
  });
});

// Doctor portal: the logged-in doctor's own patients
export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find({ doctorId: req.user._id }).sort({
    appointment_date: 1,
    appointment_time: 1,
  });
  res.status(200).json({
    success: true,
    appointments,
  });
});

// Admin sees any appointment; a doctor only their own
export const getAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  if (
    !appointment ||
    (req.user.role === "Doctor" && !appointment.doctorId.equals(req.user._id))
  ) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }
  res.status(200).json({ success: true, appointment });
});

export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { status } = req.body;
    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      return next(new ErrorHandler("Invalid appointment status!", 400));
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }
    if (appointment.hasVisited) {
      return next(
        new ErrorHandler("Patient has already visited; status can't change.", 400)
      );
    }
    // Un-rejecting: the freed slot may have been booked by someone else since
    if (
      appointment.status === "Rejected" &&
      status !== "Rejected" &&
      appointment.appointment_time &&
      (await takenTimes(appointment.doctorId, appointment.appointment_date)).includes(
        appointment.appointment_time
      )
    ) {
      return next(
        new ErrorHandler(
          `That time (${timeLabel(appointment.appointment_time)}) has been booked by another patient since.`,
          409
        )
      );
    }
    appointment.status = status;
    await appointment.save();
    broadcast("appointments");
    res.status(200).json({
      success: true,
      appointment,
      message: "Appointment Status Updated!",
    });
  }
);

// Admin: patient arrived at the hospital (or undo, before a receipt exists)
export const markVisited = catchAsyncErrors(async (req, res, next) => {
  const visited = req.body.visited !== false;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }
  if (visited && appointment.status !== "Accepted") {
    return next(
      new ErrorHandler("Accept the appointment before marking the visit.", 400)
    );
  }
  if (!visited && appointment.payment?.status === "Paid") {
    return next(
      new ErrorHandler("A receipt was already issued for this visit.", 400)
    );
  }
  if (!visited && appointment.consultationCompletedAt) {
    return next(
      new ErrorHandler("The doctor already completed this consultation.", 400)
    );
  }
  appointment.hasVisited = visited;
  appointment.visitedAt = visited ? new Date() : undefined;
  await appointment.save();
  broadcast("appointments");
  res.status(200).json({
    success: true,
    appointment,
    message: visited ? "Patient marked as arrived." : "Visit unmarked.",
  });
});

// Doctor: consultation finished (patient "out"). Optionally dispenses
// prescribed medicines from stock and collects payment for fee + medicines.
// Body: { notes, items: [{ code, quantity }], paymentMethod?: Cash|UPI|Card }
export const completeConsultation = catchAsyncErrors(async (req, res, next) => {
  const { notes = "", items = [], paymentMethod } = req.body;
  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
    return next(new ErrorHandler("Choose a payment method: Cash, UPI or Card.", 400));
  }
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    doctorId: req.user._id,
  });
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }
  if (!appointment.hasVisited) {
    return next(new ErrorHandler("The patient hasn't checked in yet.", 400));
  }
  if (appointment.consultationCompletedAt) {
    return next(new ErrorHandler("Consultation already completed.", 400));
  }

  const lines = items.length ? await takeStock(items) : [];
  let order;
  try {
    if (lines.length) {
      order = await Order.create({
        orderNumber: await nextNumber(Order, "orderNumber", "ORD"),
        source: "Prescription",
        customer: {
          name: `${appointment.firstName} ${appointment.lastName}`,
          email: appointment.email,
          phone: appointment.phone,
          address: appointment.address,
        },
        items: lines,
        subtotal: linesTotal(lines),
        total: linesTotal(lines),
        paymentStatus: "Pending",
        appointmentId: appointment._id,
        doctorName: `Dr. ${req.user.firstName} ${req.user.lastName}`,
      });
    }
    appointment.prescription = {
      notes: String(notes).trim(),
      items: lines,
      medicinesTotal: linesTotal(lines),
      orderId: order?._id,
    };
    appointment.consultationCompletedAt = new Date();
    if (paymentMethod) {
      await issueReceipt(appointment, paymentMethod);
    }
    await appointment.save();
  } catch (error) {
    await returnStock(lines);
    if (order) await order.deleteOne();
    throw error;
  }
  broadcast("appointments", ...(lines.length ? ["orders", "medicines"] : []));
  res.status(200).json({
    success: true,
    appointment,
    message: paymentMethod
      ? `Consultation completed. Receipt ${appointment.payment.receiptNumber} generated.`
      : "Consultation completed. Payment pending at reception.",
  });
});

// Admin: take payment for the visit (fee + any prescribed medicines)
export const generateReceipt = catchAsyncErrors(async (req, res, next) => {
  const { method } = req.body;
  if (!PAYMENT_METHODS.includes(method)) {
    return next(new ErrorHandler("Choose a payment method: Cash, UPI or Card.", 400));
  }
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }
  if (!appointment.hasVisited) {
    return next(
      new ErrorHandler("Mark the patient as arrived before generating a receipt.", 400)
    );
  }
  if (appointment.payment?.status === "Paid") {
    return next(new ErrorHandler("A receipt was already generated.", 400));
  }
  await issueReceipt(appointment, method);
  await appointment.save();
  broadcast("appointments", "orders");
  res.status(200).json({
    success: true,
    appointment,
    message: `Receipt ${appointment.payment.receiptNumber} generated.`,
  });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }
  await appointment.deleteOne();
  broadcast("appointments");
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});
