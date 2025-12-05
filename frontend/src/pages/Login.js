import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Login failed'
      });
    }
  };

  return (
    <div className="auth-page">
      <LoginForm onSubmit={handleLogin} />

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        New user?{' '}
        <Link to="/register" style={{ color: '#25D366', fontWeight: 'bold' }}>
          Create an account
        </Link>
      </p>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;
