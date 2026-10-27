import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLinkedin, FaTwitter } from "react-icons/fa6";
import { MdLocalHospital, MdSchedule } from "react-icons/md";

const Footer = () => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/appointment');
  };

  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MdSchedule className="text-blue-400" />
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={handleBookAppointment}
                  className="text-gray-400 text-lg hover:text-white transition-colors"
                >
                  Schedule Medical Visit
                </button>
              </li>
              
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MdLocalHospital className="text-blue-400" />
              Contact & Hours
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li>Mon - Fri: 9:00 AM - 7:00 PM</li>
              <li>Sat: 9:00 AM - 5:00 PM</li>
              <li>Sun: Closed</li>
              <li className="pt-2">Phone: 9876543210</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="h-8" />
            <span className="text-gray-400">
              © {new Date().getFullYear()} Healthcare Appointment System
            </span>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedin size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaTwitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;