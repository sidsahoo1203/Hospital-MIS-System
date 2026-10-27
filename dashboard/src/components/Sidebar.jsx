import React, { useContext, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  FaCalendarCheck,
  FaEnvelope,
  FaHospitalUser,
  FaKey,
  FaPills,
  FaRightFromBracket,
  FaUserDoctor,
  FaUserPlus,
} from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useLocation, useNavigate } from "react-router-dom";
import { errorMessage } from "../utils";

// `also`: other pages that belong to this menu item (keeps it highlighted)
const linksByRole = {
  Admin: [
    { to: "/", label: "Appointments", Icon: FaCalendarCheck, also: ["/receipt/"] },
    { to: "/doctors", label: "Doctors", Icon: FaUserDoctor },
    { to: "/doctor/addnew", label: "Add Doctor", Icon: FaUserPlus },
    { to: "/medicines", label: "Medicines", Icon: FaPills },
    { to: "/messages", label: "Messages", Icon: FaEnvelope },
  ],
  Doctor: [
    { to: "/", label: "My Patients", Icon: FaHospitalUser, also: ["/consultation/", "/receipt/"] },
    { to: "/password", label: "Password", Icon: FaKey },
  ],
};

const Sidebar = () => {
  const [show, setShow] = useState(false);

  const { isAuthenticated, setIsAuthenticated, user, setUser } =
    useContext(Context);

  const navigateTo = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    try {
      const { data } = await axios.get("/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(data.message);
      setIsAuthenticated(false);
      setUser({});
      navigateTo("/login");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const goTo = (path) => {
    navigateTo(path);
    setShow(false);
  };

  const links = linksByRole[user?.role] || [];
  const isActive = ({ to, also = [] }) =>
    pathname === to || also.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className={show ? "show sidebar" : "sidebar"}
        aria-label="Main menu"
      >
        <div className="links">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <button
                key={link.to}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(link.to)}
              >
                <link.Icon aria-hidden="true" />
                <span>{link.label}</span>
              </button>
            );
          })}
          <button className="nav-item logout" onClick={handleLogout}>
            <FaRightFromBracket aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
      <div
        className="wrapper"
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
      >
        <GiHamburgerMenu
          className="hamburger"
          aria-label="Open menu"
          onClick={() => setShow(!show)}
        />
      </div>
    </>
  );
};

export default Sidebar;
