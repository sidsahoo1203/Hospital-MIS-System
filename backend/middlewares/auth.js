import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

// Each staff role has its own login cookie
export const tokenCookieFor = {
  Admin: "adminToken",
  Doctor: "doctorToken",
};

// Allows the request if it carries a valid login cookie for one of `roles`
export const isAuthenticated = (...roles) =>
  catchAsyncErrors(async (req, res, next) => {
    for (const role of roles) {
      const token = req.cookies[tokenCookieFor[role]];
      if (!token) continue;
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      } catch {
        continue;
      }
      const user = await User.findById(decoded.id);
      if (user && user.role === role) {
        req.user = user;
        return next();
      }
    }
    return next(new ErrorHandler("Please log in to continue!", 401));
  });

export const isAdminAuthenticated = isAuthenticated("Admin");
export const isDoctorAuthenticated = isAuthenticated("Doctor");
