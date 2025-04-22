import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import chatService from "./chat.service.js";
import customError from "../../utils/customError.js";
import Response from "../../utils/utils.js";

//save Message
const saveMessage = catchAsync(async (req, res, next) => {
  try {
    console.log("req.body", req.body);
    const message = await chatService.saveMessage(req.body);
    if (!message) {
      return next(new customError("Message not saved", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, message);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      return Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

// Get Chat History
const getChatHistory = catchAsync(async (req, res, next) => {
  try {
    const chatHistory = await chatService.getChatHistory(
      req.params.userId1,
      req.params.userId2
    );
    if (!chatHistory) {
      return next(
        new customError("Chat history not found", httpStatus.BAD_REQUEST)
      );
    }
    Response.sendSuccessResponse(res, 200, chatHistory);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      return Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

// mark Messages as Read
const markMessagesAsRead = catchAsync(async (req, res, next) => {
  try {
    const result = await chatService.markMessagesAsRead(
      req.params.from,
      req.params.to
    );
    if (!result) {
      return next(
        new customError(
          "Failed to mark messages as read",
          httpStatus.BAD_REQUEST
        )
      );
    }
    Response.sendSuccessResponse(res, 200, result);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      return Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//get undred message counts
const getUnreadMessageCounts = catchAsync(async (req, res, next) => {
  try {
    const unreadCounts = await chatService.getUnreadMessageCounts(
      req.params.userId
    );
    if (!unreadCounts) {
      return next(
        new customError(
          "Unread message counts not found",
          httpStatus.BAD_REQUEST
        )
      );
    }
    Response.sendSuccessResponse(res, 200, unreadCounts);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      return Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

//create new chat
const createChat = catchAsync(async (req, res, next) => {
  try {
    const chat = await chatService.createNewChat(
      req.body.participants,
      req.body.initialMessage
    );
    if (!chat) {
      return next(new customError("Chat not created", httpStatus.BAD_REQUEST));
    }
    Response.sendSuccessResponse(res, 200, chat);
  } catch (e) {
    console.log(e);
    if (e instanceof customError) {
      return Response.sendErrResponse(res, e.statusCode, e);
    }
    Response.sendErrResponse(res, httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

export default {
  saveMessage,
  getChatHistory,
  markMessagesAsRead,
  getUnreadMessageCounts,
  createChat,
};
