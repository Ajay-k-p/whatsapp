// src/components/Sidebar.js
import React, { useEffect, useState } from "react";
import ChatList from "./ChatList";
import DarkModeToggle from "./DarkModeToggle";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";   // ⬅️ ADD THIS
import "../styles/app.css";

const Sidebar = ({
  onSelectChat,
  selectedChat,
  contacts = [],
  onAddContact,   // ⬅️ receiving this from Home.js
  onLogout,
  onlineUsers = {}
}) => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  return (
    <aside className="wa-sidebar">
      
      {/* HEADER */}
      <div className="wa-sidebar-header">

        {/* USER INFO */}
        <div
          className="wa-user-info"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="wa-user-avatar">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="avatar" className="wa-user-avatar-img" />
            ) : (
              <div className="wa-avatar-placeholder-small">
                {(user?.name || "U").charAt(0)}
              </div>
            )}
          </div>

          <div className="wa-user-text">
            <div className="wa-user-name">{user?.name || "You"}</div>
            <div className="wa-user-status">
              {onlineUsers[user._id] ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* ICONS */}
        <div className="wa-sidebar-icons">
          <i className="fa fa-circle-o-notch"></i>
          <i className="fa fa-comment"></i>
          <i className="fa fa-ellipsis-v"></i>
          <DarkModeToggle />
          <button className="wa-logout-btn" onClick={onLogout}>⎋</button>
        </div>
      </div>

      {/* REAL SEARCH BAR */}
      <div className="wa-search">
        <SearchBar onAddContact={onAddContact} />
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
