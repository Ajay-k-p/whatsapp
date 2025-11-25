// src/components/Header.js
import React from "react";
import { useAuth } from "../hooks/useAuth";
import "../styles/app.css";

const Header = ({ otherUser, selectedChatData, onlineUsers = {}, onBack }) => {
  const { user } = useAuth();

  if (!otherUser) {
    return (
      <div className="wa-header">
        <span className="wa-header-empty">Select a chat to start messaging</span>
      </div>
    );
  }

  const isOnline = onlineUsers[otherUser._id] === true;

  return (
    <div className="wa-header">

      {/* ---------- MOBILE BACK BUTTON ---------- */}
      <button className="wa-header-back" onClick={onBack}>
        <i className="fa fa-arrow-left"></i>
      </button>

      {/* LEFT SIDE */}
      <div className="wa-header-left">
        <div className="wa-header-avatar">
          {otherUser.profilePic ? (
            <img src={otherUser.profilePic} alt="avatar" />
          ) : (
            <div className="wa-avatar-placeholder">
              {(otherUser.name || "U").charAt(0)}
            </div>
          )}

          <span className={`wa-online-dot ${isOnline ? "online" : ""}`}></span>
        </div>

        <div className="wa-header-title">
          <div className="wa-title-main">{otherUser.name}</div>

          <div className="wa-title-sub">
            {isOnline
              ? "Online"
              : otherUser.lastSeen
              ? `last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "last seen recently"}
          </div>
        </div>
      </div>

      {/* RIGHT ACTIONS (Hidden on mobile) */}
      <div className="wa-header-actions">
        <button className="icon-btn">🔍</button>
        <button className="icon-btn">📞</button>
        <button className="icon-btn">🎥</button>
        <button className="icon-btn">⋯</button>
      </div>
    </div>
  );
};

export default Header;
