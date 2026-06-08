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
  try {
    const variantGroup = await prisma.variantGroup.create({
      data: {
        name,
        isRequired,
      },
    });
    return variantGroup;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create variant group", 500);
  }
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
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get variant groups", 500);
  }
};

export const getVariantGroupByIdService = async ({
  variantGroupId,
}: {
  variantGroupId: string;
}): Promise<VariantGroup & { variants: Variant[] }> => {
  try {
    const variantGroup = await prisma.variantGroup.findUnique({
      where: { id: variantGroupId },
      include: { variants: true },
    });
    if (!variantGroup) {
      throw new AppError("Variant group not found", 404);
    }
    return variantGroup;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get variant group", 500);
  }
};

export const updateVariantGroupService = async ({
  variantGroupId,
  data,
}: {
  variantGroupId: string;
  data: Prisma.VariantGroupUpdateInput;
}): Promise<VariantGroup> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update variant group", 500);
  }
};

export const deleteVariantGroupService = async ({
  variantGroupId,
}: {
  variantGroupId: string;
}): Promise<{ message: string }> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete variant group", 500);
  }
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
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create variant", 500);
  }
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
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get variants", 500);
  }
};

export const getVariantByIdService = async ({
  variantId,
}: {
  variantId: string;
}): Promise<Variant> => {
  try {
    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
      },
    });
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }
    return variant;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get variant", 500);
  }
};

export const updateVariantService = async ({
  variantId,
  data,
}: {
  variantId: string;
  data: Prisma.VariantUpdateInput;
}): Promise<Variant> => {
  try {
    const variant = await prisma.variant.update({
      where: { id: variantId },
      data,
    });
    if (!variant) {
      throw new AppError("Variant not found", 404);
    }
    return variant;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update variant", 500);
  }
};

export const deleteVariantService = async ({
  variantId,
}: {
  variantId: string;
}): Promise<{ message: string }> => {
  try {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete variant", 500);
  }
};
