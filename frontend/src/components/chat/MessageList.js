import React from "react";

const MessageList = ({ messages, currentUser }) => {
  return (
    <div className="message-list">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`message ${
            msg.sender._id === currentUser._id ? "sent" : "received"
          }`}
        >
          {msg.messageType === "image" && (
            <img src={msg.mediaUrl} alt="media" />
          )}
          <p>{msg.content}</p>
          <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
