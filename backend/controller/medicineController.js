import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Medicine } from "../models/medicineSchema.js";
import { Order } from "../models/orderSchema.js";
import { broadcast } from "../utils/events.js";
import { linesTotal, returnStock, takeStock } from "../utils/stock.js";
import { nextNumber } from "../utils/numbering.js";
import { PROMO_CODES, STORE_DELIVERY_FEE, storeTotals } from "../utils/fees.js";

// Public: prices and stock for the patient website and the doctor's prescription
export const getMedicines = catchAsyncErrors(async (req, res, next) => {
  const medicines = await Medicine.find().sort({ category: 1, name: 1 });
  res.status(200).json({
    success: true,
    medicines,
    deliveryFee: STORE_DELIVERY_FEE,
    promoCodes: Object.keys(PROMO_CODES),
  });
});

// Admin: add received stock
export const restockMedicine = catchAsyncErrors(async (req, res, next) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
    return next(new ErrorHandler("Enter a whole number of units to add.", 400));
  }
  const medicine = await Medicine.findOneAndUpdate(
    { code: req.params.code },
    { $inc: { stock: quantity } },
    { new: true }
  );
  if (!medicine) {
    return next(new ErrorHandler("Medicine not found!", 404));
  }
  broadcast("medicines");
  res.status(200).json({
    success: true,
    medicine,
    message: `Added ${quantity} units of ${medicine.name}. Now ${medicine.stock} in stock.`,
  });
});

// Public: checkout on the patient website (pay on delivery)
export const placeStoreOrder = catchAsyncErrors(async (req, res, next) => {
  const { customer = {}, items, promoCode } = req.body;
  const { name, email, phone, address } = customer;
  if (!name || !email || !phone || !address) {
    return next(new ErrorHandler("Please fill in all delivery details.", 400));
  }
  if (!/^\d{10}$/.test(String(phone))) {
    return next(new ErrorHandler("Phone number must have 10 digits.", 400));
  }
  const lines = await takeStock(items);
  try {
    const totals = storeTotals(linesTotal(lines), promoCode);
    const order = await Order.create({
      orderNumber: await nextNumber(Order, "orderNumber", "ORD"),
      source: "Store",
      customer: { name, email, phone, address },
      items: lines,
      ...totals,
      promoCode: totals.discount ? String(promoCode).trim().toUpperCase() : undefined,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
    });
    broadcast("orders", "medicines");
    res.status(201).json({
      success: true,
      order,
      message: `Order ${order.orderNumber} placed.`,
    });
  } catch (error) {
    await returnStock(lines);
    throw error;
  }
});

// Admin: every medicine sale, newest first
export const getOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, orders });
});

// Admin: store order paid on delivery
export const markOrderPaid = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found!", 404));
  }
  if (order.paymentStatus === "Paid") {
    return next(new ErrorHandler("Order is already paid.", 400));
  }
  if (order.source !== "Store") {
    return next(
      new ErrorHandler("Prescription orders are paid with the consultation receipt.", 400)
    );
  }
  order.paymentStatus = "Paid";
  await order.save();
  broadcast("orders");
  res.status(200).json({ success: true, order, message: `Order ${order.orderNumber} marked as paid.` });
});
