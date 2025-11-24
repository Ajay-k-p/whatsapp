import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; 
// Replace with backend URL when deployed

// Helper to build token headers
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// REGISTER USER
export const register = async (data) => {
  return axios.post(`${API_URL}/register`, data);
};

// LOGIN USER
export const login = async (data) => {
  return axios.post(`${API_URL}/login`, data);
};

// GET LOGGED-IN USER (protected)
export const getMe = async (token) => {
  return axios.get(`${API_URL}/me`, authHeader(token));
};
