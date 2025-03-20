import { Router } from "express";
import authRoute from "./auth/auth.route.js";
import userRoutes from "./users/user.route.js";
import rideRoutes from "./rides/ride.routes.js";
import walletRoutes from "./wallet/wallet.route.js";
import chatRoutes from "./chat/chat.route.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoutes);
router.use("/rides", rideRoutes);
router.use("/wallet", walletRoutes);
router.use("/chat", chatRoutes);

export default (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/rides", rideRoutes);
  app.use("/api/v1/wallet", walletRoutes);
  app.use("/api/v1/chat", chatRoutes);
};
