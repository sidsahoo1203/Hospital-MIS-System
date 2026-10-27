import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext, formatINR } from '../context/StoreContext';
import { MdArrowBack, MdLocalShipping, MdPayment } from 'react-icons/md';

const PROMO_RATES = { DISCOUNT10: 0.1 }; // must match backend/utils/fees.js

const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2f3d7e] focus:border-transparent outline-none transition-all";

const PlaceOrder = () => {
  const { cartItems, getTotalCartAmount, getCartItemCount, clearCart, deliveryFee: storeDeliveryFee, refreshInventory } = useContext(StoreContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', street: '',
    city: '', state: '', zip: '', phone: '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : storeDeliveryFee;
  const discount = Math.round(subtotal * (PROMO_RATES[appliedPromo] || 0));
  const total = subtotal + deliveryFee - discount;
  const isEmpty = getCartItemCount() === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePromoCodeSubmit = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError('Promo code cannot be empty');
    } else if (PROMO_RATES[code]) {
      setAppliedPromo(code);
      setPromoError('');
    } else {
      setAppliedPromo('');
      setPromoError('Invalid promo code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { firstName, lastName, email, street, city, state, zip, phone } = formData;
      const { data } = await axios.post('/api/v1/medicines/orders', {
        customer: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          address: `${street}, ${city}, ${state} - ${zip}`,
        },
        items: Object.entries(cartItems)
          .filter(([, quantity]) => quantity > 0)
          .map(([code, quantity]) => ({ code, quantity })),
        promoCode: appliedPromo,
      });
      clearCart();
      refreshInventory();
      navigate('/orderconfirmed', { state: { order: data.order } });
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Could not place the order. Please try again.');
      refreshInventory();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24">
      {/* Back Button */}
      <button
        onClick={() => navigate('/cart')}
        aria-label="Back to cart"
        className="fixed bottom-7 right-8 z-50 bg-[#2f3d7e] text-white p-4 rounded-full shadow-lg hover:bg-[#1f2b5e] transition-all duration-200
          animate-bounce hover:animate-none
          hover:scale-110
          ring-4 ring-blue-100 hover:ring-blue-200
          hover:shadow-xl"
      >
        <MdArrowBack className="text-2xl" />
      </button>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-6">
            <MdLocalShipping className="text-[#2f3d7e] text-4xl" />
          </div>
          <h1 className="text-4xl font-bold text-[#2f3d7e] mb-4">Checkout</h1>
          <p className="text-gray-600">Complete your order details</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Delivery Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-[#2f3d7e] mb-6">Delivery Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className={inputClass} />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className={inputClass} />
                </div>
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className={inputClass} />
                <input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} required className={inputClass} />
                <div className="grid grid-cols-2 gap-6">
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required className={inputClass} />
                  <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <input type="text" name="zip" placeholder="PIN Code" inputMode="numeric" pattern="[0-9]{6}" title="6-digit PIN code" value={formData.zip} onChange={handleChange} required className={inputClass} />
                  <input type="tel" name="phone" placeholder="Phone Number" pattern="[0-9]{10}" title="10-digit mobile number" value={formData.phone} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-[#2f3d7e] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">{formatINR(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo})</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between font-bold text-lg text-[#2f3d7e]">
                    <span>Total</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Payment: cash on delivery</p>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#2f3d7e] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handlePromoCodeSubmit}
                    className="px-6 py-3 bg-[#2f3d7e] text-white rounded-lg hover:bg-[#1f2b5e] transition-colors duration-200"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="mt-2 text-red-500 text-sm">{promoError}</p>
                )}
              </div>

              {isEmpty && (
                <p className="mb-3 text-sm text-red-500 text-center">
                  Your cart is empty. Add medicines from the store first.
                </p>
              )}
              {submitError && (
                <p className="mb-3 text-sm text-red-500 text-center" role="alert">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isEmpty || submitting}
                className="w-full bg-[#2f3d7e] text-white py-4 rounded-lg hover:bg-[#1f2b5e] transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <MdPayment className="text-xl" />
                {submitting ? 'Placing order…' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;
