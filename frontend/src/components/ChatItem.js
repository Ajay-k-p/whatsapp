// src/components/ChatItem.js
import React from "react";

const ChatItem = ({ chat, onClick, active, userId, onlineUsers }) => {
  // get the other participant
  const other = chat.participants?.find((p) => p._id !== userId);

  // last message (if any)
  const last = chat.lastMessage || {};

  // unread messages
  const unread = chat.unreadCount || 0;

  // ONLINE STATUS
  const isOnline = onlineUsers?.[other?._id] === true;

  // PREVIEW TEXT
  let preview = "No messages yet";
  if (last.content) preview = last.content;
  if (last.media) {
    if (last.type === "image") preview = "📷 Photo";
    if (last.type === "video") preview = "🎥 Video";
    if (last.type === "audio") preview = "🎤 Audio";
  }

  return (
    <div
      className={`wa-chatitem ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {/* AVATAR */}
      <div className="wa-chatitem-avatar">
        {other?.profilePic ? (
          <img src={other.profilePic} alt="avatar" />
        ) : (
          <div className="placeholder" />
        )}

        {/* ONLINE INDICATOR */}
        <span className={`wa-online-dot ${isOnline ? "online" : ""}`}></span>
      </div>

      {/* BODY */}
      <div className="wa-chatitem-body">
        <div className="wa-chatitem-row">
          <div className="wa-chatitem-name">{other?.name || "Unknown"}</div>

          <div className="wa-chatitem-time">
            {last.timestamp
              ? new Date(last.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </div>

        <div className="wa-chatitem-row wa-chatitem-sub">
          {/* PREVIEW TEXT */}
          <div className="wa-chatitem-last">{preview}</div>

          {/* UNREAD BADGE */}
          {unread > 0 && (
            <div className="wa-chatitem-unread">{unread}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
