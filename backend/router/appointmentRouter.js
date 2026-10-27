import express from "express";
import {
  completeConsultation,
  deleteAppointment,
  generateReceipt,
  getAllAppointments,
  getAppointment,
  getConsultationFee,
  getMyAppointments,
  getSlots,
  markVisited,
  postAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isAuthenticated,
  isDoctorAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// Public (patient website)
router.get("/fee", getConsultationFee);
router.get("/slots", getSlots);
router.post("/post", postAppointment);

// Admin
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.put("/visit/:id", isAdminAuthenticated, markVisited);
router.post("/receipt/:id", isAdminAuthenticated, generateReceipt);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

// Doctor
router.get("/mine", isDoctorAuthenticated, getMyAppointments);
router.put("/complete/:id", isDoctorAuthenticated, completeConsultation);

// Admin or the appointment's doctor (receipt page, details)
router.get("/:id", isAuthenticated("Admin", "Doctor"), getAppointment);

export default router;
