import { Router } from "express";
import chatController from "./chat.controller.js";

const router = Router();

router.get("/:senderId/:receiverId", chatController.chat);

export default router;
