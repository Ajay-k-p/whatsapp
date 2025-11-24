import axios from "axios";

// Base API from .env
const API = process.env.REACT_APP_API_URL;

// BUILD AUTH HEADER
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// REGISTER USER
export const register = async (data) => {
  return axios.post(`${API}/api/auth/register`, data);
};

// LOGIN USER
export const login = async (data) => {
  return axios.post(`${API}/api/auth/login`, data);
};

// GET CURRENT USER
export const getMe = async (token) => {
  return axios.get(`${API}/api/auth/me`, authHeader(token));
};
