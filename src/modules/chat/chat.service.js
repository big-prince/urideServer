import Message from "../websocket/message.model.js";

const syncMessages = async ({ senderId, receiverId }) => {
  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  }).sort({ timestamp: 1 });

  return messages;
};

export default {
    syncMessages,
};
