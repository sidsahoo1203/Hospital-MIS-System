import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Appointment from "./Pages/Appointment";
import AboutUs from "./Pages/AboutUs";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Store_Home from "./Pages/Store_Home";
import Store_Cart from "./Pages/Store_Cart";
import Store_Checkout from "./Pages/Store_PlaceOrder";
import Store_Confirm_Order from "./components/Store_Confirm_Order";
import OrderConfirmed from './Pages/OrderConfirmed';
import ContactUs from './Pages/ContactUs';

const App = () => {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/store" element={<Store_Home />} />
          <Route path="/cart" element={<Store_Cart />} />
          <Route path="/placeorder" element={<Store_Checkout />} />
          <Route path="/confirmorder" element={<Store_Confirm_Order />} />
          <Route path="/orderconfirmed" element={<OrderConfirmed />} />
          <Route path="/contact" element={<ContactUs />} />
          {/* Old links such as /login and /register land on the home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;
