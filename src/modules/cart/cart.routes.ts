import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { addToCart, getCartItems } from "./cart.controllers.js";

const router = Router();

router.post("/", authMiddleware.verifyToken, addToCart);
router.get("/", authMiddleware.verifyToken, getCartItems);
// router.put("/", authMiddleware.verifyToken, updateCartItem);
// router.delete("/:cartItemId", authMiddleware.verifyToken, removeFromCart);
// router.delete("/", authMiddleware.verifyToken, clearCart);

export default router;
