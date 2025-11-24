// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { sendMessage, getMessages } from "../services/chatService";
import { useNavigate } from "react-router-dom";

import MediaUpload from "./MediaUpload";
import VoiceRecorder from "./VoiceRecorder";

const ChatWindow = ({ chatId }) => {
  const { token, user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [reactionMenu, setReactionMenu] = useState({ open: false, msgId: null });

  // UNDO delete state: { msgId, timer, backup }
  const [undoData, setUndoData] = useState(null);

  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Load messages for the chat
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

    // clear previous listeners (safety in strict mode / reconnects)
    socket.off("receiveMessage");
    socket.off("messageDelivered");
    socket.off("messageRead");
    socket.off("reactionAdded");
    socket.off("messageDeletedForAll");
    socket.off("typing");

    // join room
    socket.emit("joinChat", chatId);

    // receive new message (ignore own echo by senderId OR sender._id)
    const onReceive = (msg) => {
      // ignore if server included senderId
      if (msg?.senderId && String(msg.senderId) === String(user._id)) return;

      // ignore if server included sender object with _id or id
      const senderIdFromMsg =
        msg?.sender?._id || msg?.sender?.id || msg?.sender || msg?.from;
      if (senderIdFromMsg && String(senderIdFromMsg) === String(user._id)) return;

      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    };
    socket.on("receiveMessage", onReceive);

    const onDelivered = ({ messageId, deliveredTo }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                delivered: true,
                deliveredTo: [...new Set([...(m.deliveredTo || []), deliveredTo])],
              }
            : m
        )
      );
    };
    socket.on("messageDelivered", onDelivered);

    const onRead = ({ messageId, readerId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, read: true, readBy: [...new Set([...(m.readBy || []), readerId])] }
            : m
        )
      );
    };
    socket.on("messageRead", onRead);

    // ensure single reaction handler (replace user's previous reaction)
    const onReaction = ({ messageId, userId, emoji }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m;
          const others = (m.reactions || []).filter((r) => String(r.user) !== String(userId));
          return { ...m, reactions: [...others, { user: userId, emoji }] };
        })
      );
    };
    socket.on("reactionAdded", onReaction);

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, content: "This message was deleted", deletedForAll: true, tempDeleted: false, _backup: undefined }
            : m
        )
      );
    };
    socket.on("messageDeletedForAll", onDeleted);

    const onTyping = ({ userId }) => {
      if (String(userId) !== String(user._id)) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1400);
      }
    };
    socket.on("typing", onTyping);

    // cleanup
    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("messageDelivered", onDelivered);
      socket.off("messageRead", onRead);
      socket.off("reactionAdded", onReaction);
      socket.off("messageDeletedForAll", onDeleted);
      socket.off("typing", onTyping);
    };
  }, [socket, chatId, user._id]);

  // mark delivered/read when messages change (client-side ack)
  useEffect(() => {
    if (!messages.length || !socket) return;

    messages.forEach((m) => {
      if (!m) return;
      const senderId = m.sender?._id || m.sender || m.senderId;
      if (String(senderId) === String(user._id)) return;

      // delivered
      if (!m.delivered) {
        socket.emit("messageDelivered", { messageId: m._id, chatId, userId: user._id });
      }

      // read
      if (!m.read) {
        socket.emit("messageRead", { messageId: m._1d || m._id, chatId, readerId: user._id });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoData?.timer) clearTimeout(undoData.timer);
    };
  }, [undoData]);

  // Send text
  const handleSend = async () => {
    if (!input.trim()) return;

    const payload = { chat: chatId, content: input, type: "text" };

    try {
      const res = await sendMessage(payload, token);
      const savedMsg = res.data;

      // optimistic UI
      setMessages((prev) => [...prev, savedMsg]);
      scrollToBottom();

      // emit with senderId to prevent duplicate on receive
      socket.emit("sendMessage", { chatId, message: savedMsg, senderId: user._id });

      setInput("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // Send media (called from MediaUpload when user clicks SEND)
  const handleMediaUpload = async (url, fileType) => {
    let type = "text";
    if (fileType.startsWith("image")) type = "image";
    else if (fileType.startsWith("video")) type = "video";
    else if (fileType.startsWith("audio")) type = "audio";

    const payload = { chat: chatId, media: url, type };

    try {
      const res = await sendMessage(payload, token);
      const savedMsg = res.data;

      setMessages((prev) => [...prev, savedMsg]);
      scrollToBottom();

      socket.emit("sendMessage", { chatId, message: savedMsg, senderId: user._id });
    } catch (err) {
      console.error("Media send error:", err);
    }
  };

  // Add reaction (client -> server). Replace user's previous reaction if exists.
  const addReaction = (msgId, emoji) => {
    // optimistic local update: replace any existing reaction by this user
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== msgId) return m;
        const others = (m.reactions || []).filter((r) => String(r.user) !== String(user._id));
        return { ...m, reactions: [...others, { user: user._id, emoji }] };
      })
    );

    // emit to server
    socket.emit("addReaction", { messageId: msgId, userId: user._id, emoji });

    setReactionMenu({ open: false, msgId: null });
  };

  // actual emit to server to delete permanently (called after undo timeout)
  const performDeleteForAll = (msgId) => {
    socket.emit("deleteMessageForAll", { messageId: msgId, chatId, requesterId: user._id });
  };

  // handle delete-with-undo UX
  const handleDeleteForAll = (msgId) => {
    // backup original message
    const original = messages.find((m) => m._id === msgId);
    if (!original) return;

    // mark locally as tempDeleted so UI shows "Message deleted" immediately
    setMessages((prev) =>
      prev.map((m) => (m._id === msgId ? { ...m, tempDeleted: true, _backup: original } : m))
    );

    // clear any existing undoData for other messages
    if (undoData?.timer) {
      clearTimeout(undoData.timer);
    }

    // start 5s timer to perform actual delete
    const timer = setTimeout(() => {
      performDeleteForAll(msgId);
      setUndoData(null);
    }, 5000);

    setUndoData({ msgId, timer, backup: original });
    setReactionMenu({ open: false, msgId: null });
  };

  // Undo delete action: restore locally and cancel server request
  const handleUndo = () => {
    if (!undoData) return;
    const { msgId } = undoData;
    if (undoData.timer) clearTimeout(undoData.timer);

    setMessages((prev) =>
      prev.map((m) => {
        if (m._id === msgId && m._backup) {
          const restored = { ...m._backup };
          // ensure we clear temp flags
          delete restored.tempDeleted;
          delete restored._backup;
          return restored;
        }
        // if no backup, just clear tempDeleted
        if (m._id === msgId) {
          const copy = { ...m };
          delete copy.tempDeleted;
          delete copy._backup;
          return copy;
        }
        return m;
      })
    );

    setUndoData(null);
  };

  // Delete-for-everyone immediate (fallback if you want immediate without undo)
  const deleteForAllImmediate = (msgId) => {
    performDeleteForAll(msgId);
    setReactionMenu({ open: false, msgId: null });
  };

  // helper to get sender object (normalize when only id present)
  const resolveSender = (msg) => {
    if (!msg) return null;
    if (typeof msg.sender === "object") return msg.sender;
    if (msg.sender && typeof msg.sender === "string") {
      // we have only id — return minimal object for UI (name unknown)
      return { _id: msg.sender, name: "Unknown", profilePic: null };
    }
    if (msg.senderId) return { _id: msg.senderId, name: "Unknown", profilePic: null };
    return null;
  };

  // format time short
  const fmtTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="wa-chatwindow">
      <div className="wa-messages">
        {messages.map((msg) => {
          const sender = resolveSender(msg);
          const senderId = sender?._id || msg.senderId;
          const isMine = String(senderId) === String(user._id);

          // If tempDeleted marker is set, show the same UI as deletedForAll but allow undo (until server confirms)
          if (msg.tempDeleted && !msg.deletedForAll) {
            return (
              <div key={msg._id} className={`wa-bubble-row ${isMine ? "mine" : "theirs"}`}>
                <div className="wa-bubble">
                  <span className="wa-deleted">This message was deleted</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg._id}
              className={`wa-bubble-row ${isMine ? "mine" : "theirs"}`}
              onContextMenu={(e) => {
                e.preventDefault();
                setReactionMenu({ open: true, msgId: msg._id });
              }}
            >
              <div className="wa-bubble">
                {msg.deletedForAll ? (
                  <span className="wa-deleted">This message was deleted</span>
                ) : (
                  <>
                    {/* TEXT */}
                    {msg.content && <span>{msg.content}</span>}

                    {/* IMAGE */}
                    {msg.type === "image" && <img src={msg.media} alt="img" className="wa-img" />}

                    {/* VIDEO */}
                    {msg.type === "video" && (
                      <video controls src={msg.media} className="wa-video" />
                    )}

                    {/* AUDIO - WhatsApp style with avatar */}
                    {msg.type === "audio" && (
                      <div className="wa-audio-bubble">
                        {/* Avatar (click to profile) */}
                        <div
                          className="wa-audio-avatar"
                          onClick={() => {
                            // navigate to profile page with sender object
                            navigate("/profile", { state: { user: sender } });
                          }}
                        >
                          {sender?.profilePic ? (
                            <img src={sender.profilePic} alt="avatar" />
                          ) : (
                            <div className="wa-avatar-placeholder">
                              {(sender?.name || "U").charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* actual audio player */}
                        <audio src={msg.media} controls className="wa-audio-player" />

                        {/* duration fallback */}
                        <div className="wa-audio-info">
                          <span className="wa-audio-duration">{msg.duration || "0:00"}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* META area: time + ticks */}
                <div className="wa-meta">
                  <span className="wa-time">{fmtTime(msg.timestamp)}</span>

                  {isMine && !msg.deletedForAll && (
                    <span className="wa-ticks">
                      {msg.read ? <span className="blue">✓✓</span> : msg.delivered ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>

                {/* reactions (badges) */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="wa-reactions">
                    {msg.reactions.map((r, i) => (
                      <div className="reaction-badge" key={i}>
                        {r.emoji}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
        {typing && <p className="wa-typing">Typing...</p>}
      </div>

      {/* Reaction popup (centered). You can later change to position by mouse coords) */}
      {reactionMenu.open && (
        <div className="wa-reaction-popup">
          {["👍", "❤️", "😂", "😮", "😢", "👏"].map((emo) => (
            <span key={emo} onClick={() => addReaction(reactionMenu.msgId, emo)}>
              {emo}
            </span>
          ))}

          <span className="delete-all" onClick={() => handleDeleteForAll(reactionMenu.msgId)}>
            🗑 Delete for everyone
          </span>

          <span className="delete-all" onClick={() => deleteForAllImmediate(reactionMenu.msgId)} style={{ marginLeft: 8 }}>
            🗑 Delete now
          </span>
        </div>
      )}

      {/* UNDO banner (appears when a delete-with-undo is pending) */}
      {undoData && (
        <div className="wa-undo-banner" role="status" aria-live="polite">
          <span>Message deleted</span>
          <button onClick={handleUndo}>Undo</button>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="wa-inputbar">
        <MediaUpload onUpload={handleMediaUpload} />
        <VoiceRecorder onUpload={handleMediaUpload} />

        <input
          className="wa-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={() => {
            socket.emit("typing", { chatId, userId: user._id });
          }}
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
