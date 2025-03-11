import authRoute from "./auth/auth.route.js";
import userRoutes from "./users/user.route.js";
import rideRoutes from "./rides/ride.routes.js";
import walletRoutes from "./wallet/wallet.route.js";

export default (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/rides", rideRoutes);
  app.use("/api/v1/wallet", walletRoutes);
};
