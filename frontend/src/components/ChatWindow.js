// src/components/chat/ChatWindow.js
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { sendMessage, getMessages } from "../services/chatService";
import { useNavigate } from "react-router-dom";

import MediaUpload from "./MediaUpload";
import VoiceRecorder from "./VoiceRecorder";

const ChatWindow = ({ chatId }) => {
  const { user, token } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* =========================
     LOAD MESSAGES
  ========================= */
  useEffect(() => {
    if (!chatId || !token) return;

    const load = async () => {
      try {
        const res = await getMessages(chatId, token);
        setMessages(res.data || []);
        scrollToBottom();
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    load();
  }, [chatId, token]);

  /* =========================
     SOCKET LISTENERS
  ========================= */
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("joinChat", chatId);

    const onReceiveMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    };

    const onStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, status } : m
        )
      );
    };

    const onTyping = ({ userId }) => {
      if (String(userId) !== String(user._id)) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1200);
      }
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("messageStatusUpdate", onStatusUpdate);
    socket.on("typing", onTyping);

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("messageStatusUpdate", onStatusUpdate);
      socket.off("typing", onTyping);
    };
  }, [socket, chatId, user._id]);

  /* =========================
     MARK MESSAGES AS READ
  ========================= */
  useEffect(() => {
    if (!socket || !messages.length) return;

    messages.forEach((m) => {
      const senderId =
        typeof m.sender === "object" ? m.sender._id : m.sender;

      if (
        String(senderId) !== String(user._id) &&
        m.status !== "read"
      ) {
        socket.emit("messageRead", {
          messageId: m._id,
          readerId: user._id,
        });
      }
    });
  }, [messages, socket, user._id]);

  /* =========================
     SEND TEXT MESSAGE
  ========================= */
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await sendMessage(
        { chat: chatId, content: input, type: "text" },
        token
      );

      const savedMsg = res.data;

      // optimistic UI
      setMessages((prev) => [...prev, savedMsg]);
      scrollToBottom();

      socket.emit("sendMessage", {
        chatId,
        messageId: savedMsg._id,
      });

      setInput("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* =========================
     SEND MEDIA MESSAGE
  ========================= */
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

      socket.emit("sendMessage", {
        chatId,
        messageId: savedMsg._id,
      });
    } catch (err) {
      console.error("Media send error:", err);
    }
  };

  /* =========================
     HELPERS
  ========================= */
  const resolveSender = (msg) => {
    if (typeof msg.sender === "object") return msg.sender;
    return { _id: msg.sender, name: "Unknown" };
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="wa-chatwindow">
      <div className="wa-messages">
        {messages.map((msg) => {
          const sender = resolveSender(msg);
          const isMine = String(sender._id) === String(user._id);

          return (
            <div
              key={msg._id}
              className={`wa-bubble-row ${isMine ? "mine" : "theirs"}`}
            >
              <div className="wa-bubble">
                {/* MESSAGE CONTENT */}
                {msg.type === "text" && <span>{msg.content}</span>}
                {msg.type === "image" && (
                  <img src={msg.media} alt="img" className="wa-img" />
                )}
                {msg.type === "video" && (
                  <video src={msg.media} controls className="wa-video" />
                )}
                {msg.type === "audio" && (
                  <audio src={msg.media} controls />
                )}

                {/* META */}
                <div className="wa-meta">
                  <span className="wa-time">
                    {formatTime(msg.createdAt)}
                  </span>

                  {isMine && (
                    <span className="wa-ticks">
                      {msg.status === "sent" && "✓"}
                      {msg.status === "delivered" && "✓✓"}
                      {msg.status === "read" && (
                        <span className="blue">✓✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
        {typing && <p className="wa-typing">Typing…</p>}
      </div>

      {/* INPUT BAR */}
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
