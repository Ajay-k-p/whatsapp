import axios from "axios";

// Base API from environment variable (.env)
const API = process.env.REACT_APP_API_URL;

// Reusable auth header
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// Get all chats
export const getChats = (token) =>
  axios.get(`${API}/api/chats`, authHeader(token));

// Send text/media/voice message
export const sendMessage = (data, token) =>
  axios.post(`${API}/api/messages`, data, authHeader(token));

// Get all messages in a chat
export const getMessages = (chatId, token) =>
  axios.get(`${API}/api/messages/${chatId}`, authHeader(token));

// Get statuses
export const getStatuses = (token) =>
  axios.get(`${API}/api/statuses`, authHeader(token));
