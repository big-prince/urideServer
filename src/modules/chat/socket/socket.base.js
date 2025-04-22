import { registerChatHandlers } from "./socket.chat.js";

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New client connected: ", socket.id);

    // Register all modules here
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected: ", socket.id);
    });
  });
};
