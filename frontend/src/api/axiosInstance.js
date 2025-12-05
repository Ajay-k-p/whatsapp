import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://whatsapp-i2eo.onrender.com/api",
  withCredentials: true
});

export default axiosInstance;
