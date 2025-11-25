// src/services/chatService.js
import api from "../api/axios";  // FIXED PATH

// Get all chats
export const getChats = (token) =>
  api.get("/chats", {
    headers: { Authorization: `Bearer ${token}` }
  });

// Send text/media/audio
export const sendMessage = (data, token) =>
  api.post("/messages/send", data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get all messages for a chat
export const getMessages = (chatId, token) =>
  api.get(`/messages/chat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get statuses
export const getStatuses = (token) =>
  api.get("/statuses", {
    headers: { Authorization: `Bearer ${token}` }
  });
