// src/components/MessageBubble.js
import React from "react";

const MessageBubble = ({ msg, isMine }) => {
  return (
    <div className={`wa-msg ${isMine ? "mine" : "other"}`}>
      {msg.media && msg.type === "image" && (
        <img src={msg.media} alt="img" className="wa-msg-media" />
      )}
      {msg.media && msg.type === "video" && (
        <video src={msg.media} controls className="wa-msg-media" />
      )}
      {msg.media && msg.type === "audio" && (
        <audio controls src={msg.media} className="wa-msg-audio" />
      )}

      {msg.content && <div className="wa-msg-text">{msg.content}</div>}

      <div className="wa-msg-meta">
        <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
        {isMine && (
          <span className="wa-msg-tick">
            {msg.read ? <span className="tick blue">✓✓</span>
            : msg.delivered ? <span className="tick gray">✓✓</span>
            : <span className="tick gray">✓</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
