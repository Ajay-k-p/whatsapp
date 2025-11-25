// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Header from "../components/Header";
import { useSocket } from "../hooks/useSocket";

import { getChats } from "../services/chatService";

import "../styles/app.css";

const Home = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();

  const [selectedChat, setSelectedChat] = useState(null);     // holds chatId
  const [chatList, setChatList] = useState([]);               // full chat objects
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("contacts") || "[]");
    setContacts(saved);
  }, [user, navigate]);

  // Load chats from backend
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await getChats(token);
        setChatList(res.data || []);
      } catch (err) {
        console.error("Error loading chats:", err);
      }
    };
    if (token) loadChats();
  }, [token]);

  // SOCKET: setup + online/offline listeners
  useEffect(() => {
    if (!socket || !user) return;

    // ✔ FIXED: must wrap userId in object
    socket.emit("setup", { userId: user._id });

    socket.on("userOnline", ({ userId }) =>
      setOnlineUsers((prev) => ({ ...prev, [userId]: true }))
    );

    socket.on("userOffline", ({ userId }) =>
      setOnlineUsers((prev) => ({ ...prev, [userId]: false }))
    );

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket, user]);

  // Add contact from SearchBar
  const handleAddContact = (contact) => {
    if (!contacts.some((c) => c._id === contact._id)) {
      const updated = [...contacts, contact];
      setContacts(updated);
      localStorage.setItem("contacts", JSON.stringify(updated));
    }
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Resolve the full chat object from ID
  const activeChatObj = chatList.find((c) => c._id === selectedChat) || null;

  // Resolve the "other user" for header
  const otherUser = activeChatObj
    ? activeChatObj.participants?.find((p) => p._id !== user._id)
    : null;

  if (!user) return null;

  return (
    <div className="wa-app">

      {/* SIDEBAR */}
      <Sidebar
        onSelectChat={setSelectedChat}
        selectedChat={selectedChat}
        contacts={contacts}
        onAddContact={handleAddContact}
        onLogout={handleLogout}
        onlineUsers={onlineUsers}
      />

      {/* RIGHT SIDE / CHAT WINDOW */}
      {selectedChat ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header otherUser={otherUser} onlineUsers={onlineUsers} />
          <ChatWindow chatId={selectedChat} />
        </div>
      ) : (
        <div className="wa-chat-empty">
          <h2>WhatsApp Clone</h2>
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Home;
