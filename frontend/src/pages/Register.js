import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalize phone (remove spaces, +, -)
    const normalizedPhone = phone.replace(/[^\d]/g, "").trim();

    // Validation
    if (!normalizedPhone || normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      alert("Phone number must be between 10–15 digits");
      return;
    }

    if (!password || password.length < 4) {
      alert("Password must be at least 4 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        phone: normalizedPhone,
        password,
        // name is OPTIONAL
        ...(name.trim() && { name: name.trim() }),
      });

      if (res?.data?.user && res?.data?.token) {
        alert("Registered successfully! Please login.");
        navigate("/login");
      } else {
        console.warn("Unexpected register response:", res);
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Register error:", err);

      const backendMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed. Phone may already be registered.";

      alert(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        {/* OPTIONAL NAME */}
        <input
          type="text"
          placeholder="Full Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
          }}
        />

        {/* PHONE */}
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
          }}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            width: "100%",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
