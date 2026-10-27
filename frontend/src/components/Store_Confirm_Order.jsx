import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";

const StoreConfirmOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderDetails } = location.state || {};

  const handleBackToStore = () => {
    navigate("/store");
  };

  useEffect(() => {

    gsap.fromTo(
      ".order-confirmation",
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "power1.out" }
    );
  }, []);

  return (
    <div className="bg-slate-200 overflow-y-hidden h-screen"
    style={{ zIndex: 1000, position: 'relative' }}
    >
    <div
      className="container flex flex-col items-center justify-center h-screen overflow-y-hidden ml-20 bg-black-100"
      style={{ zIndex: 1000, position: 'relative' }} // Set z-index and position
    >
      <div className="order-confirmation bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-gray-700 mb-4">
          Thank you for your order! We appreciate your business.
        </p>
        <div className="bg-gray-50 p-4 rounded-md border mb-4">
          <h2 className="text-xl font-semibold">Order Details:</h2>
          <ul className="text-left mt-2">
            {orderDetails ? (
              <>
                <li>Total: ${orderDetails.total.toFixed(2)}</li>
                <li>Order Number: #{orderDetails.orderNumber}</li>
              </>
            ) : (
              <li>No order details available</li>
            )}
          </ul>
        </div>
        <button
          onClick={handleBackToStore}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
        >
          Back to Store
        </button>
      </div>
    </div>
    </div>
  );
};

export default StoreConfirmOrder;
