// frontend/src/api/axios.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://whatsapp-i2eo.onrender.com';

console.log("🔥 Using API Base:", API_BASE); // helpful in Vercel builds

const instance = axios.create({
  baseURL: API_BASE + '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

instance.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (err) => Promise.reject(err)
);

export default instance;
