import express from "express";
import chatController from "./chat.controller.js";
import Logged from "../../middlewares/logged.js";
import routeLogger from "../../middlewares/route.js";
import extractAccess from "../../middlewares/extractAccess.js";

const router = express.Router();

// //sav message
// router.post(
//   "/save_message",
//   routeLogger,
//   extractAccess,
//   chatController.saveMessage
// );
// //get chat history
// router.get(
//   "/get_chat_history/:userId1/:userId2",
//   routeLogger,
//   extractAccess,
//   chatController.getChatHistory
// );
// //mark messages as read
// router.post(
//   "/mark_messages_as_read/:from/:to",
//   routeLogger,
//   extractAccess,
//   chatController.markMessagesAsRead
// );
// //get unread messages count
// router.get(
//   "/get_unread_messages_count/:userId",
//   routeLogger,
//   extractAccess,
//   chatController.getUnreadMessagesCount
// );
// // createChat
// router.post(
//   "/create_chat",
//   routeLogger,
//   extractAccess,
//   chatController.createChat
// );

export default router;
