import { z } from "zod";

export const addToCartSchema = z.object({
  menuItemId: z.string(),
  variants: z.array(z.string()),
  addons: z.array(z.string()),
  quantity: z.coerce.number().min(1).max(100),
});
