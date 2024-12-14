"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

export function useSocket(url) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketConnection = io(url);

    socketConnection.on("connect", () => {
      setIsConnected(true);
    });

    socketConnection.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.close();
    };
  }, [url]);

  return { socket, isConnected };
}
