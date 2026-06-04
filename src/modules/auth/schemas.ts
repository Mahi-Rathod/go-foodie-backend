import { z } from "zod";
import { ROLE } from "../../generated/prisma/enums.js";

export const UserRegisterSchema = z.object({
  username: z.string().min(3).max(20),
  name: z.string().min(3).max(20),
  email: z.string(),
  mobile: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid mobile number"),
  password: z.string().min(8).max(20),
  role: z.enum(ROLE).optional(),
});

export const UserLoginSchema = z.object({
  email: z.string().optional(),
  password: z.string().min(8).max(20).optional(),
  mobile: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Invalid mobile number")
    .optional(),
  otp: z.string().min(6).max(6).optional(),
  userAgent: z.string(),
  ip: z.string(),
});

export const UserDeleteSchema = z.object({
  email: z.string(),
});

export const UserVerifySchema = z.object({
  mobile: z.string(),
  otp: z.string().min(6).max(6),
});
