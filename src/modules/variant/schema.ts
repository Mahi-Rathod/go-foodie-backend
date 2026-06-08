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

export const createVariantGroupSchema = z.object({
  name: z.string().min(1).max(100),
  isRequired: formBooleanSchema(true),
});

export const updateVariantGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isRequired: optionalFormBooleanSchema,
});

export const createVariantSchema = z.object({
  variantGroupId: z.string(),
  name: z.string().min(1).max(100),
  priceModifier: z.coerce.number(),
  isDefault: formBooleanSchema(false),
  isAvailable: formBooleanSchema(true),
});

export const updateVariantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  priceModifier: z.coerce.number().optional(),
  isDefault: optionalFormBooleanSchema,
  isAvailable: optionalFormBooleanSchema,
});
