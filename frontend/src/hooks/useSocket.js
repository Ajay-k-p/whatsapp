import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (user, selectedChat, setChats, setMessages) => {
  const socket = useRef();

  useEffect(() => {
    if (user) {
      socket.current = io(process.env.REACT_APP_API_URL);
      socket.current.emit('setup', user);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      socket.current.emit('join chat', selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.current?.on('message received', (newMessage) => {
      if (selectedChat && selectedChat._id === newMessage.chat._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
      setChats((prev) => prev.map(chat => chat._id === newMessage.chat._id ? { ...chat, latestMessage: newMessage } : chat));
    });

    socket.current?.on('typing', (chatId) => {
      if (selectedChat && selectedChat._id === chatId) {
        // Handle typing UI
      }
    });

    socket.current?.on('stop typing', (chatId) => {
      // Handle stop typing UI
    });

    socket.current?.on('message seen', (messageId) => {
      setMessages((prev) => prev.map(msg => msg._id === messageId ? { ...msg, isRead: true } : msg));
    });
  }, [selectedChat, setChats, setMessages]);

  const sendMessage = (messageData) => {
    socket.current.emit('new message', messageData);
  };

  const startTyping = (chatId) => {
    socket.current.emit('typing', chatId);
  };

  const stopTyping = (chatId) => {
    socket.current.emit('stop typing', chatId);
  };

  const markAsSeen = (messageId, chatId) => {
    socket.current.emit('message seen', messageId, chatId);
  };

  return { sendMessage, startTyping, stopTyping, markAsSeen };
};

export default useSocket;