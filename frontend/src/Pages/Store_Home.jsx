import React, { useState } from 'react'
import Header from '../components/Store_Header'
import ExploreMenu from "../components/Store_ExploreMenu"
import FoodDisplay from '../components/Store_FoodDisplay'
import Navbar from '../components/Store_Navbar'
import { MdShoppingCart, MdLocalPharmacy } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const Store_Home = () => {
  const [category, setCategory] = useState('All')
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24">
      {/* Cart Button */}
      <button 
        onClick={() => navigate('/cart')}
        className="fixed bottom-7 right-8 z-50 bg-[#2f3d7e] text-white p-4 rounded-full shadow-lg transition-all duration-200 
          animate-bounce
          hover:scale-110
          ring-4 ring-blue-100 "
      >
        <MdShoppingCart className="text-2xl" />
      </button>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-6">
            <MdLocalPharmacy className="text-[#2f3d7e] text-4xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2f3d7e] mb-6">
            Medical Store
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Quality healthcare products at your fingertips
          </p>
        </div>

        {/* Category Menu */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#2f3d7e] mb-8 text-center">
            Browse Categories
          </h2>
          <div className="bg-white rounded-xl shadow-md p-6">
            <ExploreMenu category={category} setCategory={setCategory}/>
          </div>
        </div>

        {/* Products Display Section */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[#2f3d7e] mb-4">
              {category === 'All' ? 'All Products' : category}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find the perfect medical supplies for your needs
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8">
            <FoodDisplay category={category}/>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 text-center">
          <div className="inline-block p-3 bg-blue-100 rounded-xl mb-4">
            <MdShoppingCart className="text-[#2f3d7e] text-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-[#2f3d7e] mb-4">
            Need Help with Your Order?
          </h3>
          <p className="text-gray-600">
            Contact our support team at{' '}
            <span className="text-[#2f3d7e] font-semibold">9876543210</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Store_Home;
