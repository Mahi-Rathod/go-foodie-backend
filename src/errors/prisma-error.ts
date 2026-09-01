// src/errors/prisma-error.ts
import { Prisma } from "../generated/prisma/client.js";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "./app-error.js";

export function mapPrismaError(err: unknown): AppError | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return null;

  switch (err.code) {
    case "P2002": // unique constraint violation
      return new ConflictError("A record with these values already exists");

    case "P2025": // update/delete targeted a row that does not exist
      return new NotFoundError("Resource not found");

    case "P2003": // foreign key constraint violation
      return new BadRequestError("A referenced record does not exist");

    case "P2000": // value too long for the column
      return new BadRequestError("A value is too long for one of the fields");

    default:
      return null; // unknown Prisma failure → treat as a bug → 500
  }
}
