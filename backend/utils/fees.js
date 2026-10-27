// Same consultation fee for every doctor and department (INR)
export const consultationFee = () => Number(process.env.CONSULTATION_FEE) || 500;

// Online medicine store pricing (INR)
export const STORE_DELIVERY_FEE = 40;
export const PROMO_CODES = { DISCOUNT10: 0.1 }; // code -> share of subtotal off

export const storeTotals = (subtotal, promoCode) => {
  const rate = PROMO_CODES[String(promoCode || "").trim().toUpperCase()] || 0;
  const discount = Math.round(subtotal * rate);
  const deliveryFee = subtotal > 0 ? STORE_DELIVERY_FEE : 0;
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
};
