// frontend/src/services/authService.js
import api from "../api/axios";  // use global axios instance (correct)


// REGISTER USER
export const register = (data) => {
  return api.post("/auth/register", data);
};


// LOGIN USER
export const login = (data) => {
  return api.post("/auth/login", data);
};


// GET CURRENT USER INFO
export const getMe = (token) => {
  return api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
