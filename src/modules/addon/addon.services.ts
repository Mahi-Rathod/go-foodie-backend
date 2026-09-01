import { Addon, AddonGroup, Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prismaClient.js";
import { AppError } from "../../utils/app.error.js";

export const createAddonGroupService = async ({
  name,
  minSelect,
  maxSelect,
}: {
  name: string;
  minSelect: number;
  maxSelect: number;
}): Promise<AddonGroup> => {
  const addonGroup = await prisma.addonGroup.create({
    data: {
      name,
      minSelect,
      maxSelect,
    },
  });
  
  return addonGroup;
};

export const getAllAddonGroupsService = async ({
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
}): Promise<{ addonGroups: AddonGroup[]; total: number }> => {
  const where: Prisma.AddonGroupWhereInput = {
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
  };

  const [addonGroups, total] = await Promise.all([
    prisma.addonGroup.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [orderBy]: orderDirection },
      include: { addons: true },
    }),
    prisma.addonGroup.count({ where }),
  ]);

  return { addonGroups, total };
};

export const getAddonGroupByIdService = async ({
  addonGroupId,
}: {
  addonGroupId: string;
}): Promise<AddonGroup & { addons: Addon[] }> => {
  const addonGroup = await prisma.addonGroup.findUnique({
    where: { id: addonGroupId },
    include: { addons: true },
  });
  
  if (!addonGroup) {
    throw new AppError("Addon group not found", 404);
  }
  
  return addonGroup;
};

export const updateAddonGroupService = async ({
  addonGroupId,
  data,
}: {
  addonGroupId: string;
  data: Prisma.AddonGroupUpdateInput;
}): Promise<AddonGroup> => {
  const existing = await prisma.addonGroup.findUnique({
    where: { id: addonGroupId },
  });
  
  if (!existing) {
    throw new AppError("Addon group not found", 404);
  }

  const minSelect =
    typeof data.minSelect === "number" ? data.minSelect : existing.minSelect;
  const maxSelect =
    typeof data.maxSelect === "number" ? data.maxSelect : existing.maxSelect;

  if (minSelect > maxSelect) {
    throw new AppError(
      "minSelect must be less than or equal to maxSelect",
      400,
    );
  }

  const addonGroup = await prisma.addonGroup.update({
    where: { id: addonGroupId },
    data,
    include: { addons: true },
  });
  
  return addonGroup;
};

export const deleteAddonGroupService = async ({
  addonGroupId,
}: {
  addonGroupId: string;
}): Promise<{ message: string }> => {
  const existing = await prisma.addonGroup.findFirst({
    where: {
      id: addonGroupId,
    },
  });
  
  if (!existing) {
    throw new AppError("Addon group not found", 404);
  }
  
  await prisma.addonGroup.delete({
    where: { id: addonGroupId },
  });

  return { message: "Addon group deleted successfully" };
};

export const createAddonService = async ({
  addonGroupId,
  name,
  price,
  isAvailable,
}: {
  addonGroupId: string;
  name: string;
  price: number;
  isAvailable: boolean;
}): Promise<Addon> => {
  const addonGroup = await prisma.addonGroup.findUnique({
    where: { id: addonGroupId },
  });
  
  if (!addonGroup) {
    throw new AppError("Addon group not found", 404);
  }

  const addon = await prisma.addon.create({
    data: {
      name,
      price: Number(price),
      isAvailable,
      addonGroup: { connect: { id: addonGroupId } },
    },
  });
  
  return addon;
};

export const getAddonsByGroupIdService = async ({
  addonGroupId,
  offset,
  limit,
  search,
  orderBy,
  orderDirection,
  isAvailable,
}: {
  addonGroupId?: string;
  offset: number;
  limit: number;
  search: string;
  orderBy: string;
  orderDirection: "asc" | "desc";
  isAvailable?: boolean;
}): Promise<{ addons: Addon[]; total: number }> => {
  const where: Prisma.AddonWhereInput = {
    ...(addonGroupId && { addonGroupId }),
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
    ...(isAvailable !== undefined && { isAvailable }),
  };

  const [addons, total] = await Promise.all([
    prisma.addon.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { [orderBy]: orderDirection },
    }),
    prisma.addon.count({ where }),
  ]);

  return { addons, total };
};

export const getAddonByIdService = async ({
  addonId,
}: {
  addonId: string;
}): Promise<Addon> => {
  const addon = await prisma.addon.findFirst({
    where: {
      id: addonId,
    },
  });
  
  if (!addon) {
    throw new AppError("Addon not found", 404);
  }
  
  return addon;
};

export const updateAddonService = async ({
  addonId,
  data,
}: {
  addonId: string;
  addonGroupId?: string;
  data: Prisma.AddonUpdateInput;
}): Promise<Addon> => {
  const addon = await prisma.addon.update({
    where: { id: addonId },
    data,
  });
  
  if (!addon) {
    throw new AppError("Addon not found", 404);
  }
  
  return addon;
};

export const deleteAddonService = async ({
  addonId,
}: {
  addonId: string;
}): Promise<{ message: string }> => {
  const existing = await prisma.addon.findFirst({
    where: {
      id: addonId,
    },
  });
  
  if (!existing) {
    throw new AppError("Addon not found", 404);
  }

  await prisma.addon.delete({
    where: { id: addonId },
  });
  
  return { message: "Addon deleted successfully" };
};
