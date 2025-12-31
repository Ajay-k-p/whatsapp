import React, { useState } from 'react';
import UploadImage from '../common/UploadImage';

const RegisterForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pic, setPic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, email, password, pic);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Register</h2>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <UploadImage onUpload={setPic} />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;