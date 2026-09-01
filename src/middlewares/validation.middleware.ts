import { RequestHandler } from "express";
import { ZodError, ZodType } from "zod";

export interface RequestSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

class ValidationMiddleware {
  validate(schemas: RequestSchemas): RequestHandler {
    return (req, res, next) => {
      try {
        if (schemas.body) {
          req.body = schemas.body.parse(req.body);
        }

        if (schemas.params) {
          Object.assign(req.params, schemas.params.parse(req.params));
        }

        if (schemas.query) {
          Object.assign(req.query, schemas.query.parse(req.query));
        }

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(422).json({
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
              details: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
              })),
            },
          });
          return;
        }
        next(error);
      }
    };
  }
}

export const validationMiddleware = new ValidationMiddleware();
