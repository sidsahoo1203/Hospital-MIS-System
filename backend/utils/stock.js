import ErrorHandler from "../middlewares/error.js";
import { Medicine } from "../models/medicineSchema.js";

// Merges duplicate codes and validates quantities: [{ code, quantity }]
const normalize = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ErrorHandler("Add at least one medicine.", 400);
  }
  const byCode = new Map();
  for (const { code, quantity } of items) {
    const qty = Number(quantity);
    if (!code || !Number.isInteger(qty) || qty < 1) {
      throw new ErrorHandler("Invalid medicine quantity.", 400);
    }
    byCode.set(String(code), (byCode.get(String(code)) || 0) + qty);
  }
  return [...byCode].map(([code, quantity]) => ({ code, quantity }));
};

// Takes the items out of stock (all or nothing) and returns priced order lines
export const takeStock = async (items) => {
  const taken = [];
  try {
    for (const { code, quantity } of normalize(items)) {
      const medicine = await Medicine.findOneAndUpdate(
        { code, stock: { $gte: quantity } },
        { $inc: { stock: -quantity, sold: quantity } },
        { new: true }
      );
      if (!medicine) {
        const existing = await Medicine.findOne({ code });
        throw new ErrorHandler(
          existing
            ? `Only ${existing.stock} ${existing.name} left in stock.`
            : "A medicine in this order no longer exists.",
          400
        );
      }
      taken.push({ code, name: medicine.name, price: medicine.price, quantity });
    }
    return taken;
  } catch (error) {
    await returnStock(taken);
    throw error;
  }
};

export const returnStock = (lines) =>
  Promise.all(
    lines.map(({ code, quantity }) =>
      Medicine.updateOne({ code }, { $inc: { stock: quantity, sold: -quantity } })
    )
  );

export const linesTotal = (lines) =>
  lines.reduce((sum, { price, quantity }) => sum + price * quantity, 0);
