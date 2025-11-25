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

    const cleanedPhone = phone.replace(/[^\d]/g, "").trim();

    // Frontend validations
    if (!name.trim()) return alert("Name is required");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 15)
      return alert("Phone must be 10–15 digits");
    if (password.length < 4)
      return alert("Password must be at least 4 characters");

    setLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        phone: cleanedPhone,
        password: password.trim(),
      });

      if (res?.data?.user && res?.data?.token) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        console.warn("Unexpected register response:", res);
        alert("Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Register error:", err);

      const backendError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Try again.";

      alert(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "10px",
            width: "100%",
          }}
        />

        <input
          type="text"
          placeholder="Phone Number (digits only)"
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
          style={{ padding: "10px", width: "100%" }}
          disabled={loading}
        >
          {loading ? "Registering…" : "Register"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;
