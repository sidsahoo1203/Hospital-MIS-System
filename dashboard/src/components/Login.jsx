import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import { errorMessage } from "../utils";

const Login = () => {
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "/api/v1/user/login",
        { email, password, role },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(data.message);
      setUser(data.user);
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <section className="container form-component">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">HOSPITAL STAFF LOGIN</h1>
        <p>
          {role === "Admin"
            ? "Hospital administrators manage doctors, appointments and payments."
            : "Doctors: use the login ID and password given by the hospital admin."}
        </p>
        <form onSubmit={handleLogin}>
          <div className="role-switch" role="tablist" aria-label="Login as">
            {["Admin", "Doctor"].map((r) => (
              <button
                type="button"
                key={r}
                role="tab"
                aria-selected={role === r}
                className={role === r ? "active" : ""}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            type="email"
            placeholder={role === "Doctor" ? "Doctor Login ID (email)" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">Login as {role}</button>
          </div>
        </form>
      </section>
    </>
  );
};

export default Login;
