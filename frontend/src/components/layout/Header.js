import React from 'react';

const Header = ({ chat }) => (
  <div className="chat-header">
    <img src={chat.isGroupChat ? 'group-icon.png' : chat.participants[0].pic} alt="pic" />
    <div>
      <h3>{chat.chatName || chat.participants[0].name}</h3>
      <p>Online</p> {/* Placeholder for online status */}
    </div>
  </div>
);

export default Header;