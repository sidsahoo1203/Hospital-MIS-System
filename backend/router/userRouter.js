import express from "express";
import {
  addNewDoctor,
  changePassword,
  deleteDoctor,
  getAllDoctors,
  getUserDetails,
  updateDoctorPhoto,
  login,
  logout,
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isAuthenticated,
  isDoctorAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();
const isStaff = isAuthenticated("Admin", "Doctor");

// Staff sessions (Admin or Doctor)
router.post("/login", login);
router.get("/me", isStaff, getUserDetails);
router.get("/logout", logout);
router.put("/password", isDoctorAuthenticated, changePassword);

// Public: the patient website lists doctors for booking
router.get("/doctors", getAllDoctors);

// Admin only (there is exactly one admin account; see scripts/createAdmin.js)
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.put("/doctor/:id/photo", isAdminAuthenticated, updateDoctorPhoto);
router.delete("/doctor/:id", isAdminAuthenticated, deleteDoctor);

export default router;
