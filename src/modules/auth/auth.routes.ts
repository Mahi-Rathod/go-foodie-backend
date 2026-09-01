import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
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
import {
  loginUserSchema,
  refreshTokenSchema,
  registerUserSchema,
  sendLoginOtpSchema,
  verifyUserSchema,
} from "./schemas.js";

const router = Router();

router.post(
  "/register",
  validationMiddleware.validate({ body: registerUserSchema }),
  registerUser,
);

router.post(
  "/send-login-otp",
  validationMiddleware.validate({ body: sendLoginOtpSchema }),
  sendLoginOtp,
);

router.post(
  "/login/otp",
  validationMiddleware.validate({ body: loginUserSchema }),
  loginUserByOtp,
);

router.post(
  "/login/password",
  validationMiddleware.validate({ body: loginUserSchema }),
  loginUserByPassword,
);

router.post(
  "/verify",
  validationMiddleware.validate({ body: verifyUserSchema }),
  verifyUser,
);

router.post(
  "/logout",
  validationMiddleware.validate({ body: refreshTokenSchema }),
  logout,
);
router.post(
  "/refresh",
  validationMiddleware.validate({ body: refreshTokenSchema }),
  refreshToken,
);
router.post(
  "/logout-all",
  validationMiddleware.validate({ body: refreshTokenSchema }),
  logoutAll,
);
router.get("/profile", authMiddleware.requireAuth, getProfile);

router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/reset-password", resetForgotPassword);

export const authRouter = router;
