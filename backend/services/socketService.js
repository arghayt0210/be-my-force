const socketService = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("message", (data) => {
      console.log("Message received:", data);
      io.emit("message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = socketService;
