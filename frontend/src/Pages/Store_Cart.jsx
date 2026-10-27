import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext, formatINR } from '../context/StoreContext'
import Navbar from '../components/Store_Navbar'
import { MdArrowBack, MdAdd, MdRemove } from 'react-icons/md';

const Cart = () => {
  const { cartItems, removeFromCart, removeItem, addToCart, food_list, getTotalCartAmount, getCartItemCount, deliveryFee: storeDeliveryFee } = useContext(StoreContext);
  const navigate = useNavigate();

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : storeDeliveryFee;
  const total = subtotal + deliveryFee;
  const isEmpty = getCartItemCount() === 0;

  const handleDecrement = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      removeFromCart(itemId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24">
      {/* Back to Store Button */}
      <button 
        onClick={() => navigate('/store')}
        className="fixed bottom-7 right-8 z-50 bg-[#2f3d7e] text-white p-4 rounded-full shadow-lg hover:bg-[#1f2b5e] transition-all duration-200 
          animate-bounce hover:animate-none
          hover:scale-110
          ring-4 ring-blue-100 hover:ring-blue-200
          hover:shadow-xl"
      >
        <MdArrowBack className="text-2xl" />
      </button>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#2f3d7e] mb-8 text-center">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {isEmpty ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/store')}
                    className="text-[#2f3d7e] font-medium hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {food_list.map((item) => {
                    const quantity = cartItems[item._id];
                    if (quantity > 0) {
                      return (
                        <div key={item._id} className="p-6 flex items-center gap-4">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                            <p className="text-[#2f3d7e] font-bold">{formatINR(item.price)}</p>
                            {quantity > item.stock && (
                              <p className="text-sm text-red-500">Only {item.stock} left in stock</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                            <button 
                              onClick={() => handleDecrement(item._id, quantity)}
                              className={`p-1 rounded-full transition-colors ${
                                quantity > 1 
                                  ? 'hover:bg-gray-200 text-[#2f3d7e]' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              disabled={quantity <= 1}
                            >
                              <MdRemove className="text-xl" />
                            </button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <button 
                              onClick={() => addToCart(item._id)}
                              disabled={quantity >= item.stock}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors text-[#2f3d7e] disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <MdAdd className="text-xl" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            ❌
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{formatINR(deliveryFee)}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#2f3d7e]">{formatINR(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/placeorder')}
                disabled={isEmpty}
                className="w-full bg-[#2f3d7e] text-white py-3 rounded-lg hover:bg-[#1f2b5e] transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
