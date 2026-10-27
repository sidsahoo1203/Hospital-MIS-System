import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { errorMessage } from "../utils";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        "/api/v1/user/password",
        { currentPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );
      toast.success(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <section className="page">
      <section className="container form-component">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">CHANGE PASSWORD</h1>
        <p>Replace the password you were given with one only you know (at least 8 characters).</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Current Password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">Update Password</button>
          </div>
        </form>
      </section>
    </section>
  );
};

export default ChangePassword;
