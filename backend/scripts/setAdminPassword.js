// Changes the hospital admin's password (the dashboard deliberately has no
// "change password" for the shared admin account).
// Usage: npm run set-admin-password -- <newPassword>
import { config } from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/userSchema.js";

config({ path: "./config/.env" });

const [newPassword] = process.argv.slice(2);
if (!newPassword || newPassword.length < 8) {
  console.error("Usage: npm run set-admin-password -- <newPassword>  (at least 8 characters)");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
try {
  const admin = await User.findOne({ role: "Admin" }).select("+password");
  if (!admin) {
    console.log("No admin exists yet. Use `npm run create-admin` first.");
    process.exitCode = 1;
  } else {
    admin.password = newPassword;
    await admin.save();
    console.log(
      `Password changed for ${admin.email}. Existing logins stay valid until they expire.`
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
