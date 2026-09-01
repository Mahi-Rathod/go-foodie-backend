import { Request, RequestHandler, Response } from "express";
import { OTP_PURPOSE } from "../../generated/prisma/enums.js";
import { otpService } from "../../services/otp.service.js";
import { smsService } from "../../services/sms.service.js";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import { getUserByIdService } from "../user/user.services.js";
import {
  loginUserByOtpService,
  loginUserByPasswordService,
  logoutAllService,
  logoutService,
  refreshTokenService,
  registerUserService,
  resetForgotPasswordService,
  sendForgotPasswordOtpService,
  verifyUserService,
} from "./auth.services.js";

export const registerUser: RequestHandler = async (req, res) => {
  const { username, name, email, mobile, password, role } = req.body;

  const { user } = await registerUserService({
    username,
    name,
    email,
    mobile,
    password,
    role,
  });

  return apiResponseUtils.success({
    res,
    message: "User registered successfully",
    data: user,
    statusCode: 201,
  });
};

export const verifyUser: RequestHandler = async (req, res) => {
  const { otp, identifier, purpose } = req.body;

  const { user } = await verifyUserService({ otp, identifier, purpose });

  return apiResponseUtils.success({
    res,
    message: "User verified successfully",
    data: user,
    statusCode: 200,
  });
};

export const loginUserByPassword: RequestHandler = async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    "";

  const userAgent = req.headers["user-agent"] || "";

  const { email, password, mobile } = req.body;

  const { user, accessToken, refreshToken } = await loginUserByPasswordService({
    identifier: mobile ?? email ?? "",
    password,
    ip,
    userAgent,
  });

  return apiResponseUtils.success({
    res,
    message: "User logged in successfully",
    data: { user, accessToken, refreshToken },
    statusCode: 200,
  });
};

export const loginUserByOtp: RequestHandler = async (req, res) => {
  const { mobile, otp } = req.body;

  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    "";

  const userAgent = req.headers["user-agent"] || "";

  const { user, accessToken, refreshToken } = await loginUserByOtpService({
    mobile,
    otp,
    ip,
    userAgent,
  });

  return apiResponseUtils.success({
    res,
    message: "User logged in successfully",
    data: { user, accessToken, refreshToken },
    statusCode: 200,
  });
};

export const sendLoginOtp: RequestHandler = async (req, res) => {
  const { mobile } = req.body;

  const { otp } = await otpService.generateOtp({
    identifier: mobile,
    purpose: OTP_PURPOSE.LOGIN,
  });

  await smsService.sendOTP(mobile, otp);

  return apiResponseUtils.success({
    res,
    message: "OTP sent successfully",
    data: { mobile },
    statusCode: 200,
  });
};

export const logout: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body;

  const result = await logoutService(refreshToken);
  return apiResponseUtils.success({
    res,
    message: result.message,
    statusCode: 200,
  });
};

export const logoutAll: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body;

  const result = await logoutAllService(refreshToken);

  return apiResponseUtils.success({
    res,
    message: result.message,
    statusCode: 200,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.socket.remoteAddress ||
      "";
    const userAgent = req.headers["user-agent"] || "";

    if (!refreshToken) {
      return apiResponseUtils.error({
        res,
        message: "Refresh token is required",
        statusCode: 400,
        error: "Refresh token is required",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenService({ refreshToken, ip, userAgent });

    return apiResponseUtils.success({
      res,
      message: "Token refreshed successfully",
      data: { accessToken, refreshToken: newRefreshToken },
      statusCode: 200,
    });
  } catch (error) {
    return apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const getProfile: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.user;
  const user = await getUserByIdService(id);
  if (!user) {
    return apiResponseUtils.error({
      res,
      message: "User not found",
      statusCode: 404,
      error: "User not found",
    });
  }
  return apiResponseUtils.success({
    res,
    message: "User fetched successfully",
    data: user,
    statusCode: 200,
  });
};

export const sendForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return apiResponseUtils.error({
        res,
        message: "Mobile is required",
        statusCode: 400,
        error: "Mobile is required",
      });
    }

    const { message } = await sendForgotPasswordOtpService({ mobile });

    return apiResponseUtils.success({
      res,
      message,
      statusCode: 200,
    });
  } catch (error) {
    return apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const resetForgotPassword = async (req: Request, res: Response) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    if (!mobile || !otp || !newPassword) {
      return apiResponseUtils.error({
        res,
        message: "Mobile, OTP and new password are required",
        statusCode: 400,
        error: "Mobile, OTP and new password are required",
      });
    }

    const { message } = await resetForgotPasswordService({
      mobile,
      otp,
      newPassword,
    });

    return apiResponseUtils.success({
      res,
      message,
      statusCode: 200,
    });
  } catch (error) {
    return apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};
