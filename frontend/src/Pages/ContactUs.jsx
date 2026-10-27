import React from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdArrowBack } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import MessageForm from '../components/MessageForm';

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24">

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-6">
            <MdEmail className="text-[#2f3d7e] text-4xl" />
          </div>
          <h1 className="text-4xl font-bold text-[#2f3d7e] mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help! Reach out to us through any of these channels or fill out the form below.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
              <MdPhone className="text-[#2f3d7e] text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-[#2f3d7e] mb-2">Phone</h3>
            <p className="text-gray-600">+91 9876543210</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
              <MdEmail className="text-[#2f3d7e] text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-[#2f3d7e] mb-2">Email</h3>
            <p className="text-gray-600">support@MediTrack.com</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
              <MdLocationOn className="text-[#2f3d7e] text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-[#2f3d7e] mb-2">Address</h3>
            <p className="text-gray-600">123 Healthcare St, Medical City, MC 12345</p>
          </div>
        </div>

        {/* Message Form */}
        <div className="max-w-3xl mx-auto">
          <MessageForm />
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 