const { Server } = require("socket.io");
const socketService = require("../services/socketService");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true, // Add this if you're using credentials
    },
  });

  socketService(io);
  return io;
};

module.exports = initializeSocket;
