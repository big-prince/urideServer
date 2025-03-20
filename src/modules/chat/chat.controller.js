import catchAsync from "../../utils/catchAsync.js";
import chatService from "./chat.service.js";

const chat = catchAsync(async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await chatService.syncMessages({ senderId, receiverId });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default {
  chat,
};
