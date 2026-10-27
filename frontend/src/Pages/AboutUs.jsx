import React from "react";
import { MdLocalHospital, MdStar, MdPeople } from "react-icons/md";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-[#2f3d7e] leading-tight">
                About MediTrack Medical Institute
              </h1>
              <p className="text-gray-600 text-lg">
                We are committed to providing comprehensive healthcare services with 
                compassion and expertise. Our team of skilled professionals ensures 
                personalized care for every patient.
              </p>
            </div>
            <div className="hidden lg:block">
              <img src="/about.png" alt="About Us" className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2f3d7e] mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              At MediTrack, we are guided by our commitment to excellence and patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto flex items-center justify-center mb-6">
                <MdLocalHospital className="text-[#2f3d7e] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#2f3d7e] mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every aspect of our healthcare services.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto flex items-center justify-center mb-6">
                <MdPeople className="text-[#2f3d7e] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#2f3d7e] mb-4">Patient Care</h3>
              <p className="text-gray-600">
                Your well-being is our top priority, with personalized attention to your needs.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto flex items-center justify-center mb-6">
                <MdStar className="text-[#2f3d7e] text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-[#2f3d7e] mb-4">Innovation</h3>
              <p className="text-gray-600">
                We embrace modern healthcare solutions for better patient outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
