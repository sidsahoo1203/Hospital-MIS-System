import { tokenCookieFor } from "../middlewares/auth.js";
import { sessionLength } from "./session.js";

export const cookieOptions = (role) => ({
  expires: new Date(Date.now() + sessionLength(role).ms),
  httpOnly: true,
  // Deployed frontends on another domain need SameSite=None + Secure (HTTPS);
  // local http development (browser and Postman) needs Lax + non-secure.
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  secure: process.env.NODE_ENV === "production",
});

// Clears every staff login cookie (used on logout and before a new login)
export const clearLoginCookies = (res) => {
  const { expires, ...options } = cookieOptions();
  for (const name of Object.values(tokenCookieFor)) {
    res.clearCookie(name, options);
  }
  return res;
};

export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  // One staff session per browser: logging in as a doctor logs out the admin
  clearLoginCookies(res)
    .status(statusCode)
    .cookie(tokenCookieFor[user.role], token, cookieOptions(user.role))
    .json({
      success: true,
      message,
      user,
      token,
    });
};
