import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createOrder,
  getOrderById,
  getOrderByRestaurantId,
  getOrders,
  updateOrderStatus,
} from "./order.controllers.js";

const router = Router();

router.post("/", authMiddleware.verifyToken, createOrder);
router.get("/", authMiddleware.verifyToken, getOrders);
router.get("/:orderId/", authMiddleware.verifyToken, getOrderById);

//Restaurant Order Routes
router.get(
  "/restaurant/:restaurantId/",
  authMiddleware.verifyToken,
  getOrderByRestaurantId,
);
router.patch(
  "/:orderId/status/",
  authMiddleware.verifyToken,
  updateOrderStatus,
);

export default router;
