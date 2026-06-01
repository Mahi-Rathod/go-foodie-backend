import { Request, Response } from "express";
import { z } from "zod";
import { OTP_PURPOSE } from "../../generated/prisma/enums.js";
import { otpService } from "../../services/otp.service.js";
import { smsService } from "../../services/sms.service.js";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import { getUserById } from "../user/user.services.js";
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
import {
  UserLoginSchema,
  UserRegisterSchema,
  UserVerifySchema,
} from "./schemas.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = UserRegisterSchema.parse(req.body);

    const { user } = await registerUserService(validatedData);

    return apiResponseUtils.success({
      res,
      message: "User registered successfully",
      data: user,
      statusCode: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
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

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const validatedData = UserVerifySchema.parse(req.body);

    const { user } = await verifyUserService({
      otp: validatedData.otp,
      identifier: validatedData.mobile,
      purpose: OTP_PURPOSE.REGISTER,
    });

    return apiResponseUtils.success({
      res,
      message: "User verified successfully",
      data: user,
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
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

export const loginUserByPassword = async (req: Request, res: Response) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.socket.remoteAddress ||
      "";
    const userAgent = req.headers["user-agent"] || "";
    const validatedData = UserLoginSchema.parse({
      ...req.body,
      ip,
      userAgent,
    });
    if (!validatedData.mobile || !validatedData.password) {
      return apiResponseUtils.error({
        res,
        message: "Email and password are required",
        statusCode: 400,
        error: "Email and password are required",
      });
    }

    const { user, accessToken, refreshToken } =
      await loginUserByPasswordService({
        identifier: validatedData.mobile || validatedData.email || "",
        password: validatedData.password,
        ip,
        userAgent,
      });

    return apiResponseUtils.success({
      res,
      message: "User logged in successfully",
      data: { user, accessToken, refreshToken },
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
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

export const loginUserByOtp = async (req: Request, res: Response) => {
  try {
    const { mobile, otp } = req.body;

    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.socket.remoteAddress ||
      "";

    const userAgent = req.headers["user-agent"] || "";

    const validatedData = UserLoginSchema.parse({
      mobile,
      otp,
      userAgent,
      ip,
    });

    if (!validatedData.mobile || !validatedData.otp) {
      return apiResponseUtils.error({
        res,
        message: "Mobile and OTP are required",
        statusCode: 400,
        error: "Mobile and OTP are required",
      });
    }

    const { user, accessToken, refreshToken } = await loginUserByOtpService({
      mobile: validatedData.mobile,
      otp: validatedData.otp,
      ip: validatedData.ip,
      userAgent: validatedData.userAgent,
    });

    return apiResponseUtils.success({
      res,
      message: "User logged in successfully",
      data: { user, accessToken, refreshToken },
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
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

export const sendLoginOtp = async (req: Request, res: Response) => {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
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

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return apiResponseUtils.error({
      res,
      message: "Refresh token is required",
      statusCode: 400,
      error: "Refresh token is required",
    });
  }

  try {
    const result = await logoutService(refreshToken);
    return apiResponseUtils.success({
      res,
      message: result.message,
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

export const logoutAll = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return apiResponseUtils.error({
        res,
        message: "Refresh token is required",
        statusCode: 400,
        error: "Refresh token is required",
      });
    }

    const result = await logoutAllService(refreshToken);

    return apiResponseUtils.success({
      res,
      message: result.message,
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

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    if (!id) {
      return apiResponseUtils.error({
        res,
        message: "User not found",
        statusCode: 404,
        error: "User not found",
      });
    }
    const user = await getUserById(id);
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
