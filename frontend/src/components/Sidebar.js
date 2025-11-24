// src/components/Sidebar.js
import React, { useEffect, useState } from "react";
import ChatList from "./ChatList";
import DarkModeToggle from "./DarkModeToggle";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import "../styles/app.css";

const Sidebar = ({
  onSelectChat,
  selectedChat,
  contacts = [],
  onLogout,
}) => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [onlineUsers, setOnlineUsers] = useState({});

  // Track online users
  useEffect(() => {
    if (!socket) return;

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
  }, [socket]);

  return (
    <aside className="wa-sidebar">
      <div className="wa-sidebar-header">

        {/* USER INFO BLOCK */}
        <div
          className="wa-user-info"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          {/* AVATAR */}
          <div className="wa-user-avatar">

            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="avatar"
                className="wa-user-avatar-img"
              />
            ) : (
              <div className="wa-avatar-placeholder-small">
                {(user?.name || "U").charAt(0)}
              </div>
            )}

          </div>

          {/* NAME + STATUS */}
          <div className="wa-user-text">
            <div className="wa-user-name">{user?.name || "You"}</div>

            <div className="wa-user-status">
              {onlineUsers[user._id] ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE ICONS */}
        <div className="wa-sidebar-icons">
          <i className="fa fa-circle-o-notch"></i>
          <i className="fa fa-comment"></i>
          <i className="fa fa-ellipsis-v"></i>

          <DarkModeToggle />

          <button className="wa-logout-btn" onClick={onLogout}>⎋</button>
        </div>

      </div>

      {/* SEARCH */}
      <div className="wa-search">
        <input placeholder="Search or start new chat" />
      </div>

      {/* CHAT LIST */}
      <ChatList
        onSelectChat={onSelectChat}
        selectedChat={selectedChat}
        contacts={contacts}
        onlineUsers={onlineUsers}
      />
    </aside>
  );
};

export default Sidebar;
