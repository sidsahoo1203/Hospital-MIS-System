import React from "react";
import AppointmentForm from "../components/AppointmentForm";
import { MdCalendarToday, MdAccessTime, MdCheckCircle } from "react-icons/md";

const Appointment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-6">
            <MdCalendarToday className="text-[#2f3d7e] text-4xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2f3d7e] mb-6">
            Book Your Appointment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Schedule your visit in just a few clicks
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <MdCalendarToday className="text-[#2f3d7e] text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#2f3d7e]">Select Date</h3>
            </div>
            <p className="text-gray-600">
              Choose your preferred appointment date from available slots
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <MdAccessTime className="text-[#2f3d7e] text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#2f3d7e]">Pick Time</h3>
            </div>
            <p className="text-gray-600">
              Select a convenient time slot for your appointment
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <MdCheckCircle className="text-[#2f3d7e] text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#2f3d7e]">Confirm</h3>
            </div>
            <p className="text-gray-600">
              Review and confirm your appointment details
            </p>
          </div>
        </div>

        {/* Appointment Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <AppointmentForm />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">Need to reschedule or cancel?</p>
          <p>Contact us at <span className="text-[#2f3d7e] font-semibold">9876543210</span></p>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
