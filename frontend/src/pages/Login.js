import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ phone, password });

      const user = res.data.user;
      const token = res.data.token;

      if (!user || !token) {
        alert("Invalid server response.");
        return;
      }

      authLogin(user, token);
      navigate('/');
      console.log('Login successful, redirecting to home');  // Debug
    } catch (err) {
      console.error('Login failed:', err.response?.data?.error || err.message);  // Debug
      alert('Invalid phone or password');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', padding: '10px', width: '100%' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', padding: '10px', width: '100%' }}
        />

        <button type="submit" style={{ padding: '10px', width: '100%' }}>
          Login
        </button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default Login;