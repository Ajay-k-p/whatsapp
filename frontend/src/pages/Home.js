// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Header from "../components/Header";
import { useSocket } from "../hooks/useSocket";

import "../styles/app.css";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();

  const [selectedChat, setSelectedChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!user) navigate("/login");

    const saved = JSON.parse(localStorage.getItem("contacts") || "[]");
    setContacts(saved);
  }, [user, navigate]);

  // socket setup and onlineUsers listener
  useEffect(() => {
    if (!socket || !user) return;

    // tell server who we are
    socket.emit("setup", user._id);

    // listen for userOnline / userOffline
    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket, user]);

  const handleAddContact = (contact) => {
    if (!contacts.some((c) => c._id === contact._id)) {
      const updated = [...contacts, contact];
      setContacts(updated);
      localStorage.setItem("contacts", JSON.stringify(updated));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="wa-app">
      <Sidebar
        onSelectChat={setSelectedChat}
        selectedChat={selectedChat}
        contacts={contacts}
        onAddContact={handleAddContact}
        onLogout={handleLogout}
        onlineUsers={onlineUsers}
      />

      {selectedChat ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header otherUser={null /* you should resolve otherUser from selectedChat */} onlineUsers={onlineUsers} />
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
