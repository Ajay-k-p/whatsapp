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

    // normalize phone: remove spaces, plus signs, dashes
    const normalizedPhone = phone.replace(/[^\d]/g, "").trim();

    // Frontend validation
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      alert("Phone number must be between 10-15 digits");
      return;
    }
    if (!name.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!password || password.length < 4) {
      alert("Password must be at least 4 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        phone: normalizedPhone,
        password,
      });

      // Expecting backend to return { message, user, token } on success
      if (res?.data?.user && res?.data?.token) {
        alert("Registered successfully! Please login now.");
        // Option A: go to login page
        navigate("/login");

        // Option B: auto-login (uncomment if you prefer auto-login)
        // const { token, user } = res.data;
        // // call your AuthContext.login(user, token) here if you have access to it
      } else {
        // If backend returned something unexpected
        console.warn("Unexpected register response:", res);
        alert("Registration failed. Try again.");
      }
    } catch (err) {
      console.log("Register error:", err);

      // Prefer exact backend error when available
      const backendMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (err?.message && String(err.message)) ||
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
    </div>
  );
};

export default Register;
