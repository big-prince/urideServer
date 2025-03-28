import { Router } from "express";
import routeLogger from "../../middlewares/route.js";
import chatController from "./chat.controller.js";

const router = Router();

router.get("/:senderId/:receiverId", routeLogger, chatController.chat);

export default router;
