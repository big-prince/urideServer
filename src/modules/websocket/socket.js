import jwt from "jsonwebtoken";
import Message from "./message.model.js";

const setupWebSocket = (io) => {
  // Middleware to authenticate WebSocket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, "your_jwt_secret");
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Handle sending messages
    socket.on("send_message", async ({ content, receiverId }) => {
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        content,
      });

      await message.save();

      // Emit the message to the receiver (if connected)
      io.to(receiverId).emit("receive_message", message);
    });

    // Handle joining a room for group chats
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};

export default setupWebSocket;
