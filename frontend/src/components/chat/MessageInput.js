import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import useSocket from '../../hooks/useSocket';

const MessageInput = ({ chatId, setMessages }) => {
  const [content, setContent] = useState('');
  const { sendMessage } = useSocket();

  const handleSend = async () => {
    const { data } = await axiosInstance.post('/messages', { content, chatId });
    sendMessage(data);
    setMessages(prev => [...prev, data]);
    setContent('');
  };

  return (
    <div className="message-input">
      <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message..." />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;