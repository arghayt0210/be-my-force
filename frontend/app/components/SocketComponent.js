"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:5000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SocketComponent() {
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [apiResponse, setApiResponse] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Socket connection
    const socketConnection = io(SOCKET_SERVER_URL);

    socketConnection.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server");
    });

    socketConnection.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server");
    });

    setSocket(socketConnection);

    // Test API call
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/test`);
        const data = await response.json();
        setApiResponse(data.message);
      } catch (error) {
        console.error("API Error:", error);
        setApiResponse("Error connecting to API");
      }
    };

    fetchData();

    return () => {
      socketConnection.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("message", (data) => {
      console.log("Received message:", data);
      setReceivedMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (socket && message) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Connection Status */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center ${
            isConnected ? "text-green-500" : "text-red-500"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {/* API Test Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">API Test</h2>
        <div className="p-4 bg-gray-100 rounded">
          <p>API Response: {apiResponse || "Loading..."}</p>
        </div>
      </div>

      {/* Socket Test Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Socket Test</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border p-2 rounded"
            placeholder="Enter message"
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected}
            className={`px-4 py-2 rounded transition-colors ${
              isConnected
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Received Messages</h2>
        <div className="border rounded p-4">
          {receivedMessages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            <ul className="space-y-2">
              {receivedMessages.map((msg, index) => (
                <li key={index} className="p-2 bg-gray-50 rounded">
                  {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
