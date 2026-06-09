import z from "zod";

export const createOrderSchema = z.object({
  orders: z.array(
    z.object({
      menuItemId: z.string(),
      variants: z.array(z.string()),
      addons: z.array(z.string()),
      quantity: z.number(),
      price: z.number(),
      restaurantId: z.string(),
    }),
  ),
});
