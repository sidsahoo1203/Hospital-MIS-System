import React, { useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import DoctorHome from "./components/DoctorHome";
import Receipt from "./components/Receipt";
import ChangePassword from "./components/ChangePassword";
import MedicineStore from "./components/MedicineStore";
import Consultation from "./components/Consultation";
import PrescriptionStore from "./components/PrescriptionStore";
import { Context } from "./main";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import "./App.css";

// Renders `children` only for a logged-in user with one of `roles`
const RequireRole = ({ roles, children }) => {
  const { isAuthenticated, user } = useContext(Context);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const Home = () => {
  const { isAuthenticated, user } = useContext(Context);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return user.role === "Doctor" ? <DoctorHome /> : <Dashboard />;
};

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  // Pages redirect to /login when not authenticated, so wait for the session
  // check before rendering them (otherwise a refresh always logs you out).
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/api/v1/user/me", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setUser(data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
      } finally {
        setCheckingAuth(false);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  // A login that expires mid-shift (admin sessions last ADMIN_SESSION_HOURS)
  // sends the user back to the login page instead of failing silently.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(undefined, (error) => {
      const url = error.config?.url || "";
      if (
        error.response?.status === 401 &&
        !url.includes("/user/me") &&
        !url.includes("/user/login")
      ) {
        setIsAuthenticated(false);
        setUser({});
        toast.info("Your session has ended. Please log in again.", {
          toastId: "session-ended",
        });
      }
      return Promise.reject(error);
    });
    return () => axios.interceptors.response.eject(interceptor);
  }, [setIsAuthenticated, setUser]);

  if (checkingAuth) return null;

  const admin = (element) => <RequireRole roles={["Admin"]}>{element}</RequireRole>;
  const doctor = (element) => <RequireRole roles={["Doctor"]}>{element}</RequireRole>;
  const staff = (element) => (
    <RequireRole roles={["Admin", "Doctor"]}>{element}</RequireRole>
  );

  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/addnew" element={admin(<AddNewDoctor />)} />
        <Route path="/messages" element={admin(<Messages />)} />
        <Route path="/doctors" element={admin(<Doctors />)} />
        <Route path="/medicines" element={admin(<MedicineStore />)} />
        <Route path="/consultation/:id" element={doctor(<Consultation />)} />
        <Route path="/consultation/:id/medicines" element={doctor(<PrescriptionStore />)} />
        <Route path="/receipt/:id" element={staff(<Receipt />)} />
        <Route path="/password" element={doctor(<ChangePassword />)} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
