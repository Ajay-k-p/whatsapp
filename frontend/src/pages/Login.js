import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import LoginForm from '../components/auth/LoginForm';
import Toast from '../components/common/Toast';

const Login = () => {
  const [toast, setToast] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      login(data, data.token);
      navigate('/chats');
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <div className="auth-page">
      <LoginForm onSubmit={handleLogin} />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Login;