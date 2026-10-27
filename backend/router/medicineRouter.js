import express from "express";
import {
  getMedicines,
  getOrders,
  markOrderPaid,
  placeStoreOrder,
  restockMedicine,
} from "../controller/medicineController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Public (patient website, doctor prescriptions)
router.get("/", getMedicines);
router.post("/orders", placeStoreOrder);

// Admin
router.put("/:code/stock", isAdminAuthenticated, restockMedicine);
router.get("/orders/all", isAdminAuthenticated, getOrders);
router.put("/orders/:id/paid", isAdminAuthenticated, markOrderPaid);

export default router;
