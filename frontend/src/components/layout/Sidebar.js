import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ChatList from '../chat/ChatList';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const { user, chats, setSelectedChat } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={user.pic} alt="profile" />
        <ThemeToggle />
      </div>
      <ChatList chats={chats} onSelectChat={setSelectedChat} />
    </div>
  );
};

export default Sidebar;