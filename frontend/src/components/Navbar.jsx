import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdEmail } from "react-icons/md";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const navigateTo = useNavigate();

  return (
    <>
      <nav className={"container"}>
        <div className="logo">
          <img src="/logo.png" alt="logo" className="logo-img" />
        </div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <Link to={"/"} onClick={() => setShow(!show)}>
              Home
            </Link>
            <Link to={"/appointment"} onClick={() => setShow(!show)}>
              Appointment
            </Link>
            <Link to={"/about"} onClick={() => setShow(!show)}>
              About Us
            </Link>
            <Link to={"/store"} onClick={() => setShow(!show)}>
              Store
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="loginBtn btn"
              onClick={() => {
                setShow(false);
                navigateTo("/appointment");
              }}
            >
              BOOK APPOINTMENT
            </button>
            <Link 
              to="/contact" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2f3d7e] text-white hover:bg-[#1f2b5e] transition-colors duration-200"
              onClick={() => setShow(false)}
              title="Contact Us"
              aria-label="Go to Contact Us page"
            >
              <MdEmail size={20} />
            </Link>
          </div>
        </div>
        <div
          className="hamburger"
          onClick={() => setShow(!show)}
          aria-label="Toggle Navigation Menu"
        >
          <GiHamburgerMenu />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
