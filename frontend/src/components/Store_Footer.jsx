import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-gray-300 py-6 sm:py-8 md:py-10 lg:py-12'>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:justify-between">
          {/* Company Info Section */}
          <div className="flex-1 mb-6 md:mb-0">
            <img src={assets.logo} alt="Company Logo" className="w-32 sm:w-36 md:w-40 lg:w-48 mb-4 mx-auto md:mx-0" />
            <p className="text-gray-400 mb-4 text-sm sm:text-base md:text-lg text-center md:text-left">
              Your company description or slogan goes here. Provide relevant and engaging content to help users understand your brand.
            </p>
            <div className="flex justify-center md:justify-start space-x-3 sm:space-x-4">
              <a href="#" aria-label="Facebook" role="link">
                <img src={assets.facebook_icon} alt="Facebook" className="w-6 sm:w-8 h-6 sm:h-8 hover:opacity-80 transition-opacity duration-300" />
              </a>
              <a href="#" aria-label="Twitter" role="link">
                <img src={assets.twitter_icon} alt="Twitter" className="w-6 sm:w-8 h-6 sm:h-8 hover:opacity-80 transition-opacity duration-300" />
              </a>
              <a href="#" aria-label="LinkedIn" role="link">
                <img src={assets.linkedin_icon} alt="LinkedIn" className="w-6 sm:w-8 h-6 sm:h-8 hover:opacity-80 transition-opacity duration-300" />
              </a>
            </div>
          </div>

          {/* Company Links Section */}
          <div className="flex-1 mb-6 md:mb-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-white text-center md:text-left">Company</h2>
            <ul className="space-y-2 text-sm sm:text-base text-center md:text-left">
              <li><a href="/home" className="hover:text-gray-400 transition-colors duration-300">Home</a></li>
              <li><a href="/about" className="hover:text-gray-400 transition-colors duration-300">About Us</a></li>
              <li><a href="/delivery" className="hover:text-gray-400 transition-colors duration-300">Delivery</a></li>
              <li><a href="/privacy" className="hover:text-gray-400 transition-colors duration-300">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info Section */}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-white text-center md:text-left">Get in Touch</h2>
            <ul className="space-y-2 text-sm sm:text-base text-center md:text-left">
              <li className="text-gray-400">+91 98250 98250</li>
              <li className="text-gray-400">contact@tomato.com</li>
            </ul>
          </div>
        </div>

        <hr className="my-6 sm:my-8 md:my-10 border-gray-700" />

        <p className="text-center text-gray-500 text-xs sm:text-sm md:text-base">
          Copyright 2024 © Tomato.com - All Rights Reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
