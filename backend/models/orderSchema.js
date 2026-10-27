import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // INR per unit at time of sale
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// Every medicine sale: online store orders and doctor prescriptions
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    source: { type: String, enum: ["Store", "Prescription"], required: true },
    customer: {
      name: { type: String, required: true },
      email: String,
      phone: String,
      address: String,
    },
    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, "Order has no items!"],
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: String,
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Card", "Cash on Delivery"] },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    // Prescription orders only
    appointmentId: { type: mongoose.Schema.ObjectId, ref: "Appointment" },
    doctorName: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
