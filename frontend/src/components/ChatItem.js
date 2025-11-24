// src/components/ChatItem.js
import React from "react";

const ChatItem = ({ chat, onClick, active }) => {
  const last = chat.lastMessage || {};
  const unread = chat.unreadCount || 0;
  return (
    <div className={`wa-chatitem ${active ? "active" : ""}`} onClick={onClick}>
      <img
        src={chat.avatar || "/mnt/data/Screenshot 2025-11-23 181559.png"}
        alt="avatar"
        className="wa-chatitem-avatar"
      />
      <div className="wa-chatitem-body">
        <div className="wa-chatitem-row">
          <div className="wa-chatitem-name">{chat.name || chat.title || "Unknown"}</div>
          <div className="wa-chatitem-time">
            {last.timestamp ? new Date(last.timestamp).toLocaleTimeString() : ""}
          </div>
        </div>
        <div className="wa-chatitem-row wa-chatitem-sub">
          <div className="wa-chatitem-last">{last.content || last.mediaType || "No messages"}</div>
          {unread > 0 && <div className="wa-chatitem-unread">{unread}</div>}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
