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

const addonGroupFieldsSchema = z.object({
  name: z.string().min(1).max(100),
  minSelect: z.coerce.number().min(0).max(10),
  maxSelect: z.coerce.number().min(1).max(10),
});

export const createAddonGroupSchema = addonGroupFieldsSchema.refine(
  (data) => data.minSelect <= data.maxSelect,
  {
    message: "minSelect must be less than or equal to maxSelect",
    path: ["minSelect"],
  },
);

export const updateAddonGroupSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    minSelect: z.coerce.number().min(0).max(10).optional(),
    maxSelect: z.coerce.number().min(1).max(10).optional(),
  })
  .refine(
    (data) => {
      if (data.minSelect !== undefined && data.maxSelect !== undefined) {
        return data.minSelect <= data.maxSelect;
      }
      return true;
    },
    {
      message: "minSelect must be less than or equal to maxSelect",
      path: ["minSelect"],
    },
  );

export const createAddonSchema = z.object({
  addonGroupId: z.string(),
  name: z.string().min(1).max(100),
  price: z.coerce.number().nonnegative(),
  isAvailable: formBooleanSchema(true),
});

export const updateAddonSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.coerce.number().nonnegative().optional(),
  isAvailable: optionalFormBooleanSchema,
});
