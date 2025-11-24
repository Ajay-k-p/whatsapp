// src/components/ChatList.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getChats } from "../services/chatService";
import axios from "axios";

const ChatList = ({
  onSelectChat,
  contacts = [],
  selectedChat,
  onlineUsers = {}, // 🔥 NEW
}) => {
  const { token, user } = useAuth();
  const [chats, setChats] = useState([]);

  const API = process.env.REACT_APP_API_URL; // ⬅️ IMPORTANT

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getChats(token);
        setChats(res.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
    fetchChats();
  }, [token]);

  // FIXED: uses Render Backend instead of localhost
  const createChat = async (contactId) => {
    try {
      const res = await axios.post(
        `${API}/api/chats`,
        { participants: [user._id, contactId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newChat = res.data;
      setChats((prev) => [...prev, newChat]);
      onSelectChat(newChat._id);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  return (
    <div className="wa-chatlist">
      {/* ---------------- START NEW CHAT SECTION ---------------- */}
      {contacts.length > 0 && (
        <>
          <h4 className="wa-section-title">Start New Chat</h4>

          {contacts.map((c) => (
            <div key={c._id} className="wa-chatitem">
              <div className="wa-chatitem-avatar placeholder" />
              <div className="wa-chatitem-body">
                <div className="wa-chatitem-name">{c.name}</div>
                <div className="wa-chatitem-last">📱 {c.phone}</div>
              </div>

              <button onClick={() => createChat(c._id)} className="wa-new-chat">
                Start
              </button>
            </div>
          ))}

          <h4 className="wa-section-title">Chats</h4>
        </>
      )}

      {/* ------------------- CHAT LIST ------------------------ */}
      {chats.map((chat) => {
        const last = chat.lastMessage || {};
        const other = chat.participants?.find((p) => p._id !== user._id);

        // 🔥 ONLINE STATUS
        const isOnline = onlineUsers[other?._id] === true;

        // 🔥 LAST MESSAGE PREVIEW (WhatsApp style)
        let lastPreview = "No messages yet";
        if (last.content) lastPreview = last.content;
        if (last.media) {
          if (last.type === "image") lastPreview = "📷 Photo";
          if (last.type === "video") lastPreview = "🎥 Video";
          if (last.type === "audio") lastPreview = "🎤 Audio";
        }

        return (
          <div
            key={chat._id}
            className={`wa-chatitem ${selectedChat === chat._id ? "active" : ""}`}
            onClick={() => onSelectChat(chat._id)}
          >
            {/* AVATAR */}
            <div className="wa-chatitem-avatar">
              {other?.profilePic ? (
                <img src={other.profilePic} alt="avatar" />
              ) : (
                <div className="placeholder" />
              )}

              {/* 🔥 ONLINE DOT */}
              <span className={`wa-online-dot ${isOnline ? "online" : ""}`}></span>
            </div>

            {/* CHAT CONTENT */}
            <div className="wa-chatitem-body">
              <div className="wa-chatitem-row">
                <div className="wa-chatitem-name">{other?.name || "Unknown"}</div>

                {/* TIME */}
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
                {/* LAST MESSAGE PREVIEW */}
                <div className="wa-chatitem-last">{lastPreview}</div>

                {/* 🔥 UNREAD BADGE */}
                {chat.unreadCount > 0 && (
                  <div className="wa-chatitem-unread">{chat.unreadCount}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {chats.length === 0 && (
        <div className="wa-empty">No chats yet. Start one!</div>
      )}
    </div>
  );
};

export default ChatList;
