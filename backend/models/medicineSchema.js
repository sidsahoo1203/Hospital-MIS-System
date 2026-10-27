import mongoose from "mongoose";

// Store inventory. `code` matches the product id used by the patient website
// (frontend/src/assets/assets.js), which also holds each medicine's image.
const medicineSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, min: 0 }, // INR per unit
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);
