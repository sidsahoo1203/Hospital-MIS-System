import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { clearLoginCookies, generateToken } from "../utils/jwtToken.js";
import { Appointment } from "../models/appointmentSchema.js";
import cloudinary from "cloudinary";
import { broadcast } from "../utils/events.js";

// Staff login for the hospital dashboard (Admin or Doctor)
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  if (!["Admin", "Doctor"].includes(role)) {
    return next(new ErrorHandler("Only hospital staff can log in!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler(`User Not Found With This Role!`, 400));
  }
  generateToken(user, "Login Successfully!", 201, res);
});

const AVATAR_FORMATS = ["image/png", "image/jpeg", "image/webp"];

// Uploads an optional doctor photo; returns { public_id, url } or undefined
const uploadAvatar = async (file) => {
  if (!file) return undefined;
  if (!AVATAR_FORMATS.includes(file.mimetype)) {
    throw new ErrorHandler("Photo must be a JPG, PNG or WEBP image.", 400);
  }
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "DOCTOR AVATAR",
  });
  if (!result || result.error) {
    console.error("Cloudinary Error:", result?.error || "Unknown Cloudinary error");
    throw new ErrorHandler("Failed to upload the doctor photo. Please try again.", 500);
  }
  return { public_id: result.public_id, url: result.secure_url };
};

// The photo is optional: without one the dashboard shows a placeholder,
// and the admin can add it later (updateDoctorPhoto)
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  const docAvatar = req.files?.docAvatar;
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }
  const avatar = await uploadAvatar(docAvatar);
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: avatar,
  });
  broadcast("doctors");
  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

// Admin: add or replace a doctor's photo
export const updateDoctorPhoto = catchAsyncErrors(async (req, res, next) => {
  const doctor = await User.findOne({ _id: req.params.id, role: "Doctor" });
  if (!doctor) {
    return next(new ErrorHandler("Doctor Not Found!", 404));
  }
  if (!req.files?.docAvatar) {
    return next(new ErrorHandler("Choose a photo to upload.", 400));
  }
  const avatar = await uploadAvatar(req.files.docAvatar);
  const oldId = doctor.docAvatar?.public_id;
  doctor.docAvatar = avatar;
  await doctor.save();
  if (oldId) {
    await cloudinary.uploader
      .destroy(oldId)
      .catch((error) => console.error("Cloudinary delete failed:", error.message));
  }
  broadcast("doctors");
  res.status(200).json({
    success: true,
    doctor,
    message: `Photo updated for Dr. ${doctor.firstName} ${doctor.lastName}.`,
  });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  clearLoginCookies(res).status(200).json({
    success: true,
    message: "Logged Out Successfully.",
  });
});

// Removes a doctor after re-checking the admin's password; their open
// appointments are cancelled (marked Rejected) while visited/paid
// appointments are kept for the hospital's records.
export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
  const { adminPassword } = req.body || {};
  if (!adminPassword) {
    return next(new ErrorHandler("Enter the admin password to remove a doctor.", 400));
  }
  const admin = await User.findById(req.user._id).select("+password");
  if (!(await admin.comparePassword(adminPassword))) {
    return next(new ErrorHandler("Wrong admin password. The doctor was not removed.", 403));
  }
  const doctor = await User.findOne({ _id: req.params.id, role: "Doctor" });
  if (!doctor) {
    return next(new ErrorHandler("Doctor Not Found!", 404));
  }
  const cancelled = await Appointment.updateMany(
    { doctorId: doctor._id, hasVisited: false, status: { $ne: "Rejected" } },
    { $set: { status: "Rejected" } }
  );
  if (doctor.docAvatar?.public_id) {
    await cloudinary.uploader
      .destroy(doctor.docAvatar.public_id)
      .catch((error) => console.error("Cloudinary delete failed:", error.message));
  }
  await doctor.deleteOne();
  broadcast("doctors", "appointments");
  res.status(200).json({
    success: true,
    message: `Dr. ${doctor.firstName} ${doctor.lastName} removed. ${cancelled.modifiedCount} open appointment(s) cancelled.`,
  });
});

// Lets a logged-in doctor replace the password the admin gave them.
// (The single admin's password is changed with `npm run set-admin-password`.)
export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("New passwords do not match!", 400));
  }
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return next(new ErrorHandler("Current password is incorrect!", 400));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully!",
  });
});
