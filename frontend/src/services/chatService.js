import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; 
// Change to deployed URL when needed

// Reusable header builder
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// Get all user chats
export const getChats = (token) => 
  axios.get(`${API_URL}/chats`, authHeader(token));

// Send text/media/voice message
export const sendMessage = (data, token) => 
  axios.post(`${API_URL}/messages`, data, authHeader(token));

// Get all messages in a chat
export const getMessages = (chatId, token) => 
  axios.get(`${API_URL}/messages/${chatId}`, authHeader(token));

// Get statuses
export const getStatuses = (token) =>
  axios.get(`${API_URL}/statuses`, authHeader(token));
