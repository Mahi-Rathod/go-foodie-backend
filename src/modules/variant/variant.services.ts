import {
  Prisma,
  Variant,
  VariantGroup,
} from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppError } from "../../utils/app.error.js";

export const createVariantGroupService = async ({
  name,
  isRequired,
}: {
  name: string;
  isRequired: boolean;
}): Promise<VariantGroup> => {
  const variantGroup = await prisma.variantGroup.create({
    data: {
      name,
      isRequired,
    },
  });
  
  return variantGroup;
};

export const getAllVariantGroupsService = async ({
  offset,
  limit,
  search,
  orderBy,
  orderDirection,
}: {
  offset: number;
  limit: number;
  search: string;
  orderBy: string;
  orderDirection: "asc" | "desc";
}): Promise<{ variantGroups: VariantGroup[]; total: number }> => {
  const where: Prisma.VariantGroupWhereInput = {
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
  };

  const [variantGroups, total] = await Promise.all([
    prisma.variantGroup.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [orderBy]: orderDirection },
      include: { variants: true },
    }),
    prisma.variantGroup.count({ where }),
  ]);

  return { variantGroups, total };
};

export const getVariantGroupByIdService = async ({
  variantGroupId,
}: {
  variantGroupId: string;
}): Promise<VariantGroup & { variants: Variant[] }> => {
  const variantGroup = await prisma.variantGroup.findUnique({
    where: { id: variantGroupId },
    include: { variants: true },
  });
  
  if (!variantGroup) {
    throw new AppError("Variant group not found", 404);
  }
  
  return variantGroup;
};

export const updateVariantGroupService = async ({
  variantGroupId,
  data,
}: {
  variantGroupId: string;
  data: Prisma.VariantGroupUpdateInput;
}): Promise<VariantGroup> => {
  const existing = await prisma.variantGroup.findUnique({
    where: { id: variantGroupId },
  });
  
  if (!existing) {
    throw new AppError("Variant group not found", 404);
  }

  const variantGroup = await prisma.variantGroup.update({
    where: { id: variantGroupId },
    data,
    include: { variants: true },
  });
  
  return variantGroup;
};

export const deleteVariantGroupService = async ({
  variantGroupId,
}: {
  variantGroupId: string;
}): Promise<{ message: string }> => {
  const existing = await prisma.variantGroup.findFirst({
    where: {
      id: variantGroupId,
    },
  });
  
  if (!existing) {
    throw new AppError("Variant group not found", 404);
  }

  await prisma.variantGroup.delete({
    where: { id: variantGroupId },
  });

  return { message: "Variant group deleted successfully" };
};

export const createVariantService = async ({
  variantGroupId,
  name,
  priceModifier,
  isDefault,
  isAvailable,
}: {
  variantGroupId: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  isAvailable: boolean;
}): Promise<Variant> => {
  const variantGroup = await prisma.variantGroup.findUnique({
    where: { id: variantGroupId },
  });
  
  if (!variantGroup) {
    throw new AppError("Variant group not found", 404);
  }

  const variant = await prisma.variant.create({
    data: {
      name,
      priceModifier: Number(priceModifier),
      isDefault,
      isAvailable,
      variantGroup: { connect: { id: variantGroupId } },
    },
  });
  
  return variant;
};

export const getVariantsByGroupIdService = async ({
  variantGroupId,
  offset,
  limit,
  search,
  orderBy,
  orderDirection,
  isAvailable,
}: {
  variantGroupId?: string;
  offset: number;
  limit: number;
  search: string;
  orderBy: string;
  orderDirection: "asc" | "desc";
  isAvailable?: boolean;
}): Promise<{ variants: Variant[]; total: number }> => {
  const where: Prisma.VariantWhereInput = {
    ...(variantGroupId && { variantGroupId }),
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
    ...(isAvailable !== undefined && { isAvailable }),
  };

  const [variants, total] = await Promise.all([
    prisma.variant.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [orderBy]: orderDirection },
    }),
    prisma.variant.count({ where }),
  ]);

  return { variants, total };
};

export const getVariantByIdService = async ({
  variantId,
}: {
  variantId: string;
}): Promise<Variant> => {
  const variant = await prisma.variant.findFirst({
    where: {
      id: variantId,
    },
  });
  
  if (!variant) {
    throw new AppError("Variant not found", 404);
  }
  
  return variant;
};

export const updateVariantService = async ({
  variantId,
  data,
}: {
  variantId: string;
  data: Prisma.VariantUpdateInput;
}): Promise<Variant> => {
  const variant = await prisma.variant.update({
    where: { id: variantId },
    data,
  });
  
  if (!variant) {
    throw new AppError("Variant not found", 404);
  }
  
  return variant;
};

export const deleteVariantService = async ({
  variantId,
}: {
  variantId: string;
}): Promise<{ message: string }> => {
  const existing = await prisma.variant.findFirst({
    where: {
      id: variantId,
    },
  });
  
  if (!existing) {
    throw new AppError("Variant not found", 404);
  }

  await prisma.variant.delete({
    where: { id: variantId },
  });
  
  return { message: "Variant deleted successfully" };
};
