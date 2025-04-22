import Message from "./chat.model.js";

/**
 * Save a new message to the database
 * @param {Object} messageData - Message data
 * @param {string} messageData.from - Sender ID
 * @param {string} messageData.to - Recipient ID
 * @param {string} messageData.message - Message content
 * @param {string} [messageData.type='text'] - Message type (text, image, etc.)
 * @returns {Promise<Object>} - Created message object
 */
const saveMessage = async ({ from, to, message, type = "text" }) => {
  try {
    const newMessage = await Message.create({
      from,
      to,
      message,
      type,
      read: false,
    });
    return newMessage;
  } catch (error) {
    console.error("Error saving message:", error);
    throw new Error("Failed to save message");
  }
};

/**
 * Get chat history between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Array>} - Array of message objects
 */
const getChatHistory = async (userId1, userId2) => {
  try {
    return await Message.find({
      $or: [
        { from: userId1, to: userId2 },
        { from: userId2, to: userId1 },
      ],
    }).sort({ createdAt: 1 });
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw new Error("Failed to retrieve chat history");
  }
};

/**
 * Mark messages as read
 * @param {string} from - Sender ID
 * @param {string} to - Recipient ID (current user)
 * @returns {Promise<Object>} - Update result
 */
const markMessagesAsRead = async (from, to) => {
  try {
    return await Message.updateMany({ from, to, read: false }, { read: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
};

/**
 * Get unread message count for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Object with sender IDs and unread counts
 */
const getUnreadMessageCounts = async (userId) => {
  try {
    const unreadMessages = await Message.aggregate([
      { $match: { to: userId, read: false } },
      { $group: { _id: "$from", count: { $sum: 1 } } },
    ]);

    return unreadMessages.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error getting unread messages:", error);
    throw new Error("Failed to get unread message counts");
  }
};

/**
 * Create a new chat with initial message
 * @param {Array<string>} participants - Array of participant user IDs
 * @param {Object} initialMessage - Initial message object
 * @param {string} initialMessage.from - Sender ID
 * @param {string} initialMessage.message - Message content
 * @param {string} [initialMessage.type='text'] - Message type
 * @returns {Promise<Object>} - Object with participants and the created message
 */
const createNewChat = async (participants, initialMessage) => {
  try {
    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length < 2
    ) {
      throw new Error("At least two participants are required");
    }

    if (!initialMessage || !initialMessage.from || !initialMessage.message) {
      throw new Error("Valid initial message is required");
    }

    // Ensure the sender is one of the participants
    if (!participants.includes(initialMessage.from)) {
      throw new Error("Message sender must be a participant");
    }

    // Find the recipient (the other participant)
    const to = participants.find((id) => id !== initialMessage.from);

    // Create the first message in this chat
    const message = await saveMessage({
      from: initialMessage.from,
      to,
      message: initialMessage.message,
      type: initialMessage.type || "text",
    });

    return {
      participants,
      lastMessage: message,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw new Error(`Failed to create new chat: ${error.message}`);
  }
};

export default {
  saveMessage,
  getChatHistory,
  markMessagesAsRead,
  getUnreadMessageCounts,
  createNewChat,
};
