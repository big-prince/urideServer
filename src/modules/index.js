import { Router } from "express";
import authLandRoute from "./auth/auth.route.js";
import userRoutes from "./users/user.route.js";
import rideRoutes from "./rides/ride.routes.js";
import walletRoutes from "./wallet/wallet.route.js";
import chatRoutes from "./chat/chat.routes.js";
import waterRoutes from "./water/water.route.js";
import airRouter from "./Flight/index.js";

const router = Router();

const routePrefix = "/api/v1";

export default (app) => {
  app.use(`${routePrefix}/auth`, authLandRoute);
  app.use(`${routePrefix}/users`, userRoutes);
  app.use(`${routePrefix}/rides`, rideRoutes);
  app.use(`${routePrefix}/wallet`, walletRoutes);
  app.use(`${routePrefix}/chat`, chatRoutes);
  app.use(`${routePrefix}/water`, waterRoutes);
  app.use(`${routePrefix}/air`, airRouter);
};
