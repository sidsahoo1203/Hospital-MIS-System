import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import { formatINR } from '../context/StoreContext';

const OrderConfirmed = () => {
  const navigate = useNavigate();
  const order = useLocation().state?.order;
  const [countdown, setCountdown] = useState(order ? 15 : 5);

  useEffect(() => {
    if (countdown === 0) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md mx-4">
        <div className="mb-6 flex justify-center">
          <MdCheckCircle className="text-green-500 text-7xl" />
        </div>
        <h1 className="text-3xl font-bold text-[#2f3d7e] mb-4">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        {order && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4 text-left text-gray-700">
            <p>Order number: <b>{order.orderNumber}</b></p>
            <p>Items: <b>{order.items.reduce((n, i) => n + i.quantity, 0)}</b></p>
            <p>Total to pay on delivery: <b>{formatINR(order.total)}</b></p>
          </div>
        )}
        <p className="text-sm text-gray-500">
          Redirecting to home in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmed;
