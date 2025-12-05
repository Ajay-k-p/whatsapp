import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import ChatBox from "../components/chat/ChatBox";
import LoadingSpinner from "../components/common/LoadingSpinner";
import axiosInstance from "../api/axiosInstance";   // ✅ FIXED IMPORT

const ChatPage = () => {
  const { user, selectedChat, chats, setChats, loading } =
    useContext(AuthContext);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch chats
      const fetchChats = async () => {
        try {
          const { data } = await axiosInstance.get("/chats");
          setChats(data);
        } catch (error) {
          console.error("Failed to fetch chats:", error.message);
        }
      };
      fetchChats();
    }
  }, [user, setChats]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="chat-page">
      <Sidebar chats={chats} />
      {selectedChat ? (
        <ChatBox
          selectedChat={selectedChat}
          messages={messages}
          setMessages={setMessages}
          currentUser={user}   // ✅ SEND USER TO CHATBOX
        />
      ) : (
        <div className="no-chat">Select a chat to start messaging</div>
      )}
    </div>
  );
};

export default ChatPage;
