import React from "react";
import { MdCalendarToday, MdLocalHospital, MdPeople } from "react-icons/md";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with White Background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-[#2f3d7e]">
                Your Health, <br/>
                Our Priority
              </h1>
              <p className="text-xl text-gray-600">
                Experience world-class healthcare with our team of dedicated professionals. 
                Your well-being is our commitment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/appointment"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#2f3d7e] text-white rounded-full font-semibold hover:bg-[#1f2b5e] transition-all duration-200 transform hover:scale-105"
                >
                  <MdCalendarToday className="mr-2" size={20} />
                  Book Appointment
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#2f3d7e] text-[#2f3d7e] rounded-full font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden lg:block lg:w-3/5 mx-auto">
              <img 
                src="/hero.png" 
                alt="Healthcare" 
                className="w-full h-auto rounded-2xl mt-10 transform hover:scale-105 transition-transform duration-300 shadow-xl max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2f3d7e] mb-4">Why Choose Us</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We provide comprehensive healthcare solutions with a focus on quality and patient satisfaction
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <MdLocalHospital className="text-[#2f3d7e] text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-[#2f3d7e] mb-4">Expert Care</h3>
              <p className="text-gray-600 text-lg">
                Our team of experienced healthcare professionals is dedicated to providing you with the highest quality care.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <MdCalendarToday className="text-[#2f3d7e] text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-[#2f3d7e] mb-4">Easy Scheduling</h3>
              <p className="text-gray-600 text-lg">
                Book your appointments online with our simple and convenient scheduling system.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <MdPeople className="text-[#2f3d7e] text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-[#2f3d7e] mb-4">Patient-Centered</h3>
              <p className="text-gray-600 text-lg">
                We prioritize your well-being with personalized care and attention to your specific needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
