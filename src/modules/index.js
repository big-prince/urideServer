import { Router } from "express";
import authLandRoute from "./auth/auth.route.js";
import userRoutes from "./users/user.route.js";
import rideRoutes from "./rides/ride.routes.js";
import walletRoutes from "./wallet/wallet.route.js";
import chatRoutes from "./chat/chat.route.js";
import airRouter from "./Flight/index.js";

const router = Router();

router.use("/auth", authLandRoute);
router.use("/users", userRoutes);
router.use("/rides", rideRoutes);
router.use("/wallet", walletRoutes);
router.use("/chat", chatRoutes);
router.use("/air", airRouter);

export default router;
