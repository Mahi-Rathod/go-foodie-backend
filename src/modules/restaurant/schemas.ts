import { z } from "zod";

export const ApplyForRestaurantSchema = z.object({
  name: z.string().min(3).max(20),
  fullAddress: z.string().min(3).max(100),
  city: z.string().min(3).max(20),
  state: z.string().min(5).max(20),
  pinCode: z.string().min(6).max(6),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const BankDetailsSchema = z.object({
  accountHolderName: z.string().min(3).max(40),
  accountNumber: z.string().min(4).max(12),
  bankName: z.string().min(3).max(40),
  ifsc: z.string().min(4).max(11),
  branch: z.string().min(3).max(40),
});
