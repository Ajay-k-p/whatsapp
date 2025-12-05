import React from "react";
import Header from "../layout/Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatBox = ({ selectedChat, messages, setMessages, currentUser }) => {
  return (
    <div className="chat-box">
      <Header chat={selectedChat} />

      {/* ✅ Pass user to MessageList */}
      <MessageList messages={messages} currentUser={currentUser} />

      <MessageInput chatId={selectedChat._id} setMessages={setMessages} />
    </div>
  );
};

export default ChatBox;
