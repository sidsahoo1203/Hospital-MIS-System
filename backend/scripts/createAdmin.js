// Creates THE hospital admin account (there is exactly one admin; the
// dashboard has no sign-up page). Refuses if an admin already exists.
// Usage: npm run create-admin -- <email> <password> [firstName] [lastName]
import { config } from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/userSchema.js";

config({ path: "./config/.env" });

const [email, password, firstName = "Main", lastName = "Admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password> [firstName] [lastName]");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
try {
  const existing = await User.findOne({ role: "Admin" });
  if (existing) {
    console.log(
      `The hospital already has its admin (${existing.email}). ` +
        "Use `npm run set-admin-password` to change its password."
    );
    process.exitCode = 1;
  } else if (await User.findOne({ email })) {
    console.log(`A user with email ${email} already exists.`);
    process.exitCode = 1;
  } else {
    await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: "0000000000",
      nic: "000000000000",
      dob: new Date("1990-01-01"),
      gender: "Male",
      role: "Admin",
    });
    console.log(`Admin ${email} created.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
