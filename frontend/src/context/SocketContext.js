import React, { createContext, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;  // wait for login

    const newSocket = io("http://localhost:5000", {
      auth: { token },      // ✅ send token to backend
      transports: ["websocket"], // ✅ faster + avoids polling issues
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]); // reconnect when token changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
