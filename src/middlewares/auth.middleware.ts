import { NextFunction, Request, Response } from "express";
import { ROLE, User } from "../generated/prisma/client.js";
import { tokenService } from "../services/token.service.js";
import { apiResponseUtils } from "../utils/apiResponse.utils.js";
import { AppError } from "../utils/app.error.js";

declare global {
  namespace Express {
    interface Request {
      user: Omit<
        User,
        "password" | "createdAt" | "updatedAt" | "name" | "isVerified"
      >;
    }
  }
}

class AuthMiddleware {
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return apiResponseUtils.error({
        res,
        message: "Token is required",
        statusCode: 401,
        error: "Token is required",
      });
    }

    try {
      const payload = await tokenService.verifyAccessToken(token);

      if (!payload) {
        return apiResponseUtils.error({
          res,
          message: "Unauthorized",
          statusCode: 401,
          error: "Unauthorized",
        });
      }

      req.user = {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        mobile: payload.mobile,
        role: payload.role,
      };

      next();
    } catch (error) {
      return apiResponseUtils.error({
        res,
        message: "Unauthorized",
        statusCode: 401,
        error: error instanceof Error ? error.message : "Invalid token",
      });
    }
  }

  async verifyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return apiResponseUtils.error({
          res,
          message: "Unauthorized",
          statusCode: 401,
          error: "Unauthorized",
        });
      }

      const payload = await tokenService.verifyAccessToken(token);
      if (!payload) {
        return apiResponseUtils.error({
          res,
          message: "Unauthorized",
          statusCode: 401,
          error: "Unauthorized",
        });
      }

      if (payload.role !== ROLE.ADMIN) {
        return apiResponseUtils.error({
          res,
          message: "Forbidden",
          statusCode: 401,
          error: "Forbidden",
        });
      }

      req.user = {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        mobile: payload.mobile,
        role: payload.role,
      };

      next();
    } catch (error) {
      return apiResponseUtils.error({
        res,
        message: "Unauthorized",
        statusCode: 401,
        error:
          error instanceof AppError ? error.message : "Internal server error",
      });
    }
  }
}

export const authMiddleware = new AuthMiddleware();
