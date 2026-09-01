import { z } from "zod";
import { ROLE } from "../../generated/prisma/enums.js";

export const registerUserSchema = z.object({
  username: z.string().min(3).max(20),
  name: z.string().min(3).max(20),
  email: z.string(),
  mobile: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid mobile number"),
  password: z.string().min(8).max(20),
  role: z.enum(ROLE).optional().default(ROLE.USER),
});

export const loginUserSchema = z.object({
  email: z.string().optional(),
  password: z.string().min(8).max(20).optional(),
  mobile: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Invalid mobile number")
    .optional(),
  otp: z.string().min(6).max(6).optional(),
});

export const deleteUserSchema = z.object({
  email: z.string(),
});

export const verifyUserSchema = z.object({
  mobile: z.string(),
  otp: z.string().min(6).max(6),
});

export const sendLoginOtpSchema = z.object({
  mobile: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid mobile number"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;
export type LoginUserSchema = z.infer<typeof loginUserSchema>;
export type DeleteUserSchema = z.infer<typeof deleteUserSchema>;
export type VerifyUserSchema = z.infer<typeof verifyUserSchema>;
export type SendLoginOtpSchema = z.infer<typeof sendLoginOtpSchema>;
