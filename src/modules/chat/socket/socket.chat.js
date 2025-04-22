import chatService from "../chat.service.js";

export const registerChatHandlers = (io, socket) => {
  // Handle sending messages
  socket.on("chat:message", async (data) => {
    // { from, to, message, chatId }
    try {
      const saved = await chatService.saveMessage(data);

      // Send to recipient (private message)
      io.to(data.to).emit("chat:message", saved);

      // Send back to sender for confirmation
      socket.emit("chat:message:sent", saved);
    } catch (error) {
      socket.emit("chat:error", {
        message: "Failed to send message",
        error: error.message,
      });
    }
  });

  // Handle getting chat history
  socket.on("chat:history", async ({ chatId, userId1, userId2 }) => {
    try {
      const history = await chatService.getChatHistory(
        chatId,
        userId1,
        userId2
      );
      socket.emit("chat:history", history);
    } catch (error) {
      socket.emit("chat:error", {
        message: "Failed to fetch chat history",
        error: error.message,
      });
    }
  });

  // Handle creating a new chat
  socket.on("chat:create", async ({ participants, initialMessage }) => {
    try {
      const newChat = await chatService.createNewChat(
        participants,
        initialMessage
      );

      // Notify all participants about the new chat
      participants.forEach((userId) => {
        io.to(userId).emit("chat:new", newChat);
      });

      socket.emit("chat:create:success", newChat);
    } catch (error) {
      socket.emit("chat:error", {
        message: "Failed to create chat",
        error: error.message,
      });
    }
  });

  // Handle typing indicators
  socket.on("chat:typing", ({ from, to, isTyping, chatId }) => {
    io.to(to).emit("chat:typing", { userId: from, isTyping, chatId });
  });

  // Handle message read status
  socket.on("chat:read", async ({ from, to, chatId }) => {
    try {
      await chatService.markMessagesAsRead(from, to, chatId);
      io.to(to).emit("chat:read", { userId: from, chatId });
    } catch (error) {
      socket.emit("chat:error", {
        message: "Failed to mark messages as read",
        error: error.message,
      });
    }
  });

  // Handle joining personal room for private messages
  socket.on("join", ({ userId }) => {
    socket.join(userId);
    socket.userId = userId; // Store userId in socket for reference
    console.log(`${userId} joined their private room`);
    socket.emit("join:success", { userId });
  });

  // Handle user going online/offline
  socket.on("user:status", ({ userId, status }) => {
    io.emit("user:status", { userId, status });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    if (socket.userId) {
      console.log(`${socket.userId} disconnected`);
      io.emit("user:status", { userId: socket.userId, status: "offline" });
    }
  });
};
