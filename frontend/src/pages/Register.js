import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import RegisterForm from '../components/auth/RegisterForm';
import Toast from '../components/common/Toast';

const Register = () => {
  const [toast, setToast] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (name, email, password, pic) => {
    try {
      const { data } = await axiosInstance.post('/auth/register', { name, email, password, pic });
      login(data, data.token);
      navigate('/chats');
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <div className="auth-page">
      <RegisterForm onSubmit={handleRegister} />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Register;