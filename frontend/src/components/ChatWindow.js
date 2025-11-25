// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import socket from "../socket"; // ← use REAL socket, not useSocket()
import { sendMessage, getMessages } from "../services/chatService";
import { useNavigate } from "react-router-dom";

import MediaUpload from "./MediaUpload";
import VoiceRecorder from "./VoiceRecorder";

const ChatWindow = ({ chatId }) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [reactionMenu, setReactionMenu] = useState({ open: false, msgId: null });

  const [undoData, setUndoData] = useState(null);

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Load messages
  useEffect(() => {
    if (!chatId || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await getMessages(chatId, token);
        setMessages(res.data || []);
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [chatId, token]);

  // SOCKET LISTENERS
  useEffect(() => {
    if (!socket || !chatId) return;

    // clear old listeners
    socket.off();

    // JOIN CHAT ROOM (must be object!)
    socket.emit("joinChat", { chatId });

    // SERVER: messageReceived → CLIENT
    socket.on("messageReceived", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    // SERVER: messageRead
    socket.on("messageRead", ({ messageId, readerId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                read: true,
                seenBy: [...new Set([...(m.seenBy || []), readerId])],
              }
            : m
        )
      );
    });

    // SERVER: reactionUpdated
    socket.on("reactionUpdated", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    });

    // SERVER: messageDeletedForAll
    socket.on("messageDeletedForAll", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, content: "This message was deleted", deletedForAll: true }
            : m
        )
      );
    });

    // SERVER: typing
    socket.on("typing", ({ userId }) => {
      if (String(userId) !== String(user._id)) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1400);
      }
    });

    return () => {
      socket.off();
    };
  }, [socket, chatId, user._id]);

  // DELIVERED + READ EMITS
  useEffect(() => {
    if (!messages.length || !socket) return;

    messages.forEach((m) => {
      const senderId = m.sender?._id || m.senderId || m.sender;
      if (String(senderId) === String(user._id)) return;

      // read
      if (!m.read) {
        socket.emit("messageRead", {
          messageId: m._id,
          chatId,
          readerId: user._id,
        });
      }
    });
  }, [messages]);

  // Send text
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await sendMessage(
        { chat: chatId, content: input, type: "text" },
        token
      );

      const savedMsg = res.data;
      setMessages((prev) => [...prev, savedMsg]);
      scrollToBottom();

      // send correct socket event
      socket.emit("newMessage", { messagePayload: savedMsg });

      setInput("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  // Send media
  const handleMediaUpload = async (url, fileType) => {
    let type = "text";
    if (fileType.startsWith("image")) type = "image";
    else if (fileType.startsWith("video")) type = "video";
    else if (fileType.startsWith("audio")) type = "audio";

    try {
      const res = await sendMessage(
        { chat: chatId, media: url, type },
        token
      );

      const savedMsg = res.data;
      setMessages((prev) => [...prev, savedMsg]);
      scrollToBottom();

      socket.emit("newMessage", { messagePayload: savedMsg });
    } catch (err) {
      console.error("Media error:", err);
    }
  };

  // Add reaction
  const addReaction = (msgId, emoji) => {
    socket.emit("addReaction", {
      messageId: msgId,
      reactorId: user._id,
      reaction: emoji,
    });

    setReactionMenu({ open: false, msgId: null });
  };

  // Delete message
  const handleDeleteForAll = (msgId) => {
    socket.emit("deleteMessageForAll", { messageId: msgId, chatId });
    setReactionMenu({ open: false, msgId: null });
  };

  const fmtTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="wa-chatwindow">
      <div className="wa-messages">
        {messages.map((msg) => {
          const senderId = msg.sender?._id || msg.senderId || msg.sender;
          const mine = String(senderId) === String(user._id);

          return (
            <div
              key={msg._id}
              className={`wa-bubble-row ${mine ? "mine" : "theirs"}`}
            >
              <div className="wa-bubble">
                {msg.deletedForAll ? (
                  <span className="wa-deleted">This message was deleted</span>
                ) : (
                  <>
                    {msg.content && <span>{msg.content}</span>}
                    {msg.type === "image" && (
                      <img src={msg.media} alt="" className="wa-img" />
                    )}
                    {msg.type === "video" && (
                      <video src={msg.media} controls className="wa-video" />
                    )}
                    {msg.type === "audio" && (
                      <audio src={msg.media} controls className="wa-audio" />
                    )}
                  </>
                )}

                <div className="wa-meta">
                  <span>{fmtTime(msg.createdAt)}</span>
                  {mine && !msg.deletedForAll && (
                    <span className="wa-ticks">
                      {msg.read ? (
                        <span className="blue">✓✓</span>
                      ) : (
                        "✓"
                      )}
                    </span>
                  )}
                </div>

                {msg.reactions?.length > 0 && (
                  <div className="wa-reactions">
                    {msg.reactions.map((r, i) => (
                      <div key={i}>{r.reaction}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
        {typing && <p className="wa-typing">Typing…</p>}
      </div>

      {/* Reaction Menu */}
      {reactionMenu.open && (
        <div className="wa-reaction-popup">
          {["👍", "❤️", "😂", "😮", "😢", "👏"].map((emo) => (
            <span
              key={emo}
              onClick={() => addReaction(reactionMenu.msgId, emo)}
            >
              {emo}
            </span>
          ))}

          <span
            className="delete-all"
            onClick={() => handleDeleteForAll(reactionMenu.msgId)}
          >
            🗑 Delete for everyone
          </span>
        </div>
      )}

      <div className="wa-inputbar">
        <MediaUpload onUpload={handleMediaUpload} />
        <VoiceRecorder onUpload={handleMediaUpload} />

        <input
          className="wa-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={() =>
            socket.emit("typing", { chatId, userId: user._id })
          }
          placeholder="Type a message"
        />

        <button className="wa-sendbtn" onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
