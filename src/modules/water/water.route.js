import { Router } from "express";
import waterController from "./water.controller.js";
import Logged from "../../middlewares/logged.js";
import routeLogger from "../../middlewares/route.js";
import extractAccess from "../../middlewares/extractAccess.js";
const router = Router();

router.post(
  "/send_order",
  routeLogger,
  extractAccess,
  waterController.sendOrder
);

router.post(
  "/send_coupon",
  routeLogger,
  extractAccess,
  waterController.sendCoupon
);

//get OrderFrom
router.get(
  "/get_order_from",
  routeLogger,
  extractAccess,
  waterController.getOrderFrom
);

//get OrderTo
router.get(
  "/get_order_to",
  routeLogger,
  extractAccess,
  waterController.getOrderTo
);

//get all Orders
router.get(
  "/get_all_orders",
  routeLogger,
  extractAccess,
  waterController.getAllOrders
);

//get order by id
router.get(
  "/get_order/:id",
  routeLogger,
  extractAccess,
  waterController.getOrderById
);

//get order cordinates
router.get(
  "/get_order_cordinates/:id",
  routeLogger,
  extractAccess,
  waterController.getOrderCordinates
);

//complete order
router.post(
  "/complete_order",
  routeLogger,
  extractAccess,
  waterController.completeOrder
);

//process order
router.get(
  "/process_order/:id",
  routeLogger,
  extractAccess,
  waterController.processOrder
);

export default router;
