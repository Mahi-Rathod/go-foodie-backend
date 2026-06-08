import { z } from "zod";

const parseFormBoolean = (val: unknown): boolean | undefined => {
  if (val === undefined || val === null || val === "") return undefined;
  if (val === true || val === "true") return true;
  if (val === false || val === "false") return false;
  return val as boolean;
};

const formBooleanSchema = (defaultValue: boolean) =>
  z.preprocess((val) => parseFormBoolean(val) ?? defaultValue, z.boolean());

const optionalFormBooleanSchema = z.preprocess(
  parseFormBoolean,
  z.boolean().optional(),
);

export const createMenuCategorySchema = z.object({
  restaurantId: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().nullable(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

const stringArraySchema = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return val
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return val;
}, z.array(z.string()).default([]));

export const createMenuItemSchema = z.object({
  restaurantId: z.string(),
  categoryId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  price: z.coerce.number().positive(),
  isVeg: formBooleanSchema(true),
  isAvailable: formBooleanSchema(true),
  prepTimeMins: z.coerce.number().int().positive().default(15),
  calories: z.coerce.number().int().positive().optional(),
  allergens: stringArraySchema,
  tags: stringArraySchema,
  sortOrder: z.coerce.number().default(0),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  price: z.coerce.number().positive().optional(),
  isVeg: optionalFormBooleanSchema,
  isAvailable: optionalFormBooleanSchema,
  prepTimeMins: z.coerce.number().int().positive().default(15).optional(),
  calories: z.coerce.number().int().positive().optional(),
  allergens: stringArraySchema.optional(),
  tags: stringArraySchema.optional(),
  sortOrder: z.coerce.number().default(0).optional(),
});
