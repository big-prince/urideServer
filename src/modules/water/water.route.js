import { Router } from "express";
import waterController from "./water.controller.js";
import Logged from "../../middlewares/logged.js";
import routeLogger from "../../middlewares/route.js";
import extractAccess from "../../middlewares/extractAccess.js";
const router = Router();

router.post("/send_order", routeLogger, waterController.sendOrder);

router.post("/send_coupon", routeLogger, waterController.sendCoupon);
export default router;
