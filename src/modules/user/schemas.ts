import { z } from "zod";
import { ADRESS_LABLE } from "../../generated/prisma/enums.js";

export const UserUpdateSchema = z.object({
  name: z.string().min(3).max(20).optional(),
  email: z.string().optional(),
  mobile: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Invalid mobile number")
    .optional(),
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export const AddressInputSchema = z.object({
  label: z.enum(ADRESS_LABLE),
  fullAddress: z.string().min(3).max(100),
  landmark: z.string().min(3).max(100).optional(),
  city: z.string().min(3).max(100),
  state: z.string().min(3).max(100),
  pinCode: z.string().min(3).max(100),
  country: z.string().min(3).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const AddressUpdateSchema = z.object({
  label: z.enum(ADRESS_LABLE).optional(),
  fullAdress: z.string().min(3).max(100).optional(),
  landmark: z.string().min(3).max(100).optional(),
  city: z.string().min(3).max(100).optional(),
  state: z.string().min(3).max(100).optional(),
  pinCode: z.string().min(3).max(100).optional(),
  country: z.string().min(3).max(100).optional(),
});

export type AddressInput = z.infer<typeof AddressInputSchema>;
