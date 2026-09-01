import { Router } from "express";
import { addonRouter } from "../modules/addon/addon.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { cartRouter } from "../modules/cart/cart.routes.js";
import { menuRouter } from "../modules/menu/menu.routes.js";
import { orderRouter } from "../modules/order/order.routes.js";
import { restaurantRouter } from "../modules/restaurant/restaurant.routes.js";
import { userRouter } from "../modules/user/user.routes.js";
import { variantRouter } from "../modules/variant/variant.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/restaurants", restaurantRouter);
router.use("/menu", menuRouter);
router.use("/addon", addonRouter);
router.use("/variant", variantRouter);
router.use("/cart", cartRouter);
router.use("/order", orderRouter);

export default router;
