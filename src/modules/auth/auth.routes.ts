import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  getProfile,
  loginUserByOtp,
  loginUserByPassword,
  logout,
  logoutAll,
  refreshToken,
  registerUser,
  resetForgotPassword,
  sendForgotPasswordOtp,
  sendLoginOtp,
  verifyUser,
} from "./auth.controllers.js";

const router = Router();

router.post("/register", registerUser);
router.post("/send-login-otp", sendLoginOtp);
router.post("/login/otp", loginUserByOtp);
router.post("/login/password", loginUserByPassword);
router.post("/verify", verifyUser);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/logout-all", logoutAll);
router.get("/profile", authMiddleware.verifyToken, getProfile);

router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/reset-password", resetForgotPassword);
export default router;
