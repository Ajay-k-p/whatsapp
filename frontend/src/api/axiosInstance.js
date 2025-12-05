import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://whatsapp-i2eo.onrender.com/api",
  withCredentials: true
});

export default axiosInstance;
