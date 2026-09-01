import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../env.js";
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "../errors/app-error.js";
import { mapPrismaError } from "../errors/prisma-error.js";

class ErrorMiddleware {
  notFoundHandler(req: Request, res: Response, next: NextFunction) {
    next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
  }

  toAppError(err: unknown): AppError | null {
    if (err instanceof AppError) return err;

    if (err instanceof ZodError) {
      return new ValidationError(
        "Validation Failed",
        err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    return mapPrismaError(err);
  }

  errorHandler: ErrorRequestHandler = (err, req, res, next): void => {
    if (res.headersSent) {
      next(err);
      return;
    }

    const appError = this.toAppError(err);

    if (appError) {
      if (appError.statusCode >= 500) console.error(appError);

      res.status(appError.statusCode).json({
        error: {
          code: appError.code,
          message: appError.message,
          ...(appError.details !== undefined
            ? { details: appError.details }
            : {}),
        },
      });
      return;
    }

    console.error(
      "Unhandled Error",
      { method: req.method, path: req.path },
      err,
    );

    res.status(500).json({
      error: {
        code: "INTERNAL",
        message: "Internal Server Error",
        ...(env.NODE_ENV !== "production" && err instanceof Error
          ? { details: { name: err.name, message: err.message } }
          : {}),
      },
    });
  };
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(429, "TOO_MANY_REQUESTS", message);
  }
}

export const errorMiddleware = new ErrorMiddleware();
