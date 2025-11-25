// src/context/SocketContext.js
import React, { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

// Create socket context
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !user?._id) return;

    // 🔥 Use your Render backend URL
    const SOCKET_URL =
      process.env.REACT_APP_API_BASE || "https://whatsapp-i2eo.onrender.com";

    // Create socket
    const newSocket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    // Save socket
    setSocket(newSocket);

    // 🔥 Emit setup as soon as connected
    newSocket.on("connect", () => {
      console.log("Socket Connected:", newSocket.id);

      newSocket.emit("setup", {
        userId: user._id,
      });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket Connect Error:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
