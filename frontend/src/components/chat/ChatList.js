import React from 'react';

const ChatList = ({ chats, onSelectChat }) => {
  return (
    <div className="chat-list">
      {chats.map(chat => (
        <div key={chat._id} onClick={() => onSelectChat(chat)} className="chat-item">
          <img src={chat.isGroupChat ? 'group-icon.png' : chat.participants[0].pic} alt="pic" />
          <div>
            <p>{chat.chatName || chat.participants[0].name}</p>
            <p>{chat.latestMessage?.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;