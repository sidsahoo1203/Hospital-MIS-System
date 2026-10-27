import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { MdEmail, MdPhone, MdPerson, MdMessage } from "react-icons/md";

const MessageForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [visitedBefore, setVisitedBefore] = useState(false);

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          "/api/v1/message/send",
          { firstName, lastName, email, phone, message, visitedBefore },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((res) => {
          toast.success(res.data.message);
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setMessage("");
          setVisitedBefore(false);
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <form onSubmit={handleMessage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* First Name */}
        <div className="relative">
          <MdPerson className="absolute left-3 top-3 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full pl-10 p-3 border rounded-lg focus:outline-blue-500"
          />
        </div>

        {/* Last Name */}
        <div className="relative">
          <MdPerson className="absolute left-3 top-3 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full pl-10 p-3 border rounded-lg focus:outline-blue-500"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <MdEmail className="absolute left-3 top-3 text-gray-400 text-xl" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 p-3 border rounded-lg focus:outline-blue-500"
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <MdPhone className="absolute left-3 top-3 text-gray-400 text-xl" />
          <input
            type="tel"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full pl-10 p-3 border rounded-lg focus:outline-blue-500"
          />
        </div>

        {/* Message */}
        <div className="md:col-span-2 relative">
          <MdMessage className="absolute left-3 top-3 text-gray-400 text-xl" />
          <textarea
            rows={3}
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full pl-10 p-3 border rounded-lg focus:outline-blue-500"
          />
        </div>
        {/* Submit Button */}
        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-[#2f3d7e] text-white font-semibold py-3 rounded-lg hover:bg-[#1e2c5e] transition">
            SEND MESSAGE
          </button>
        </div>

      </form>
    </div>
  );
};

export default MessageForm;
