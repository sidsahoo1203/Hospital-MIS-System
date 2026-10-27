import express from "express";
import dbConnection from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import medicineRouter from "./router/medicineRouter.js";
import { isAuthenticated } from "./middlewares/auth.js";
import { subscribe } from "./utils/events.js";
import os from "os";

const app = express();
config({ path: "./config/.env" });
// Behind Render's (and Vercel's) HTTPS proxy
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Uptime monitors ping this to keep a sleeping free-tier server awake
app.get("/api/v1/health", (req, res) => res.json({ ok: true }));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: os.tmpdir(),
  })
);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/medicines", medicineRouter);
// Live updates stream for logged-in staff dashboards
app.get("/api/v1/events", isAuthenticated("Admin", "Doctor"), subscribe);

dbConnection();

app.use(errorMiddleware);
export default app;

