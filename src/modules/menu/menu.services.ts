import {
  MenuCategory,
  MenuItem,
  Prisma,
} from "../../generated/prisma/client.js";
import { MenuCategory$imageArgs } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prismaClient.js";
import { cloudinaryService } from "../../services/claudinary.service.js";
import { AppError } from "../../utils/app.error.js";

type MenuCategoryWithImage = MenuCategory$imageArgs & { image: string };

export const createMenuCategoryService = async ({
  restaurantId,
  name,
  description,
  sortOrder,
  isActive,
  imageId,
}: {
  restaurantId: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  imageId: string;
}): Promise<MenuCategory> => {
  try {
    const menuCategory = await prisma.menuCategory.create({
      data: {
        name,
        description,
        sortOrder,
        isActive,
        restaurant: {
          connect: { id: restaurantId },
        },
        image: {
          connect: { id: imageId },
        },
      },
      include: {
        image: true,
      },
    });
    if (!menuCategory) {
      throw new AppError("Failed to create menu category", 400);
    }
    return menuCategory;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create menu category", 500);
  }
};

export const getMenuCategoriesByRestaurantIdService = async ({
  restaurantId,
  offset,
  limit,
  search,
  orderBy,
  orderDirection,
  isActive,
  sortOrder,
}: {
  restaurantId: string;
  offset: number;
  limit: number;
  search: string;
  orderBy: string;
  orderDirection: "asc" | "desc";
  isActive: boolean;
  sortOrder: number;
}): Promise<{
  menuCategories: MenuCategoryWithImage[];
  total: number;
}> => {
  try {
    const where: Prisma.MenuCategoryWhereInput = {
      restaurantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    };

    const [menuCategories, total] = await Promise.all([
      prisma.menuCategory.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
        include: {
          image: true,
        },
      }),
      prisma.menuCategory.count({ where }),
    ]);

    const menuCategoriesWithImage = await Promise.all(
      menuCategories.map(async (menuCategory) => ({
        ...menuCategory,
        image: await cloudinaryService.getSecureUrl(
          menuCategory.image?.publicId!,
        ),
      })),
    );

    return {
      menuCategories: menuCategoriesWithImage,
      total,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get menu categories", 500);
  }
};

export const getMenuCategoryByIdService = async ({
  menuCategoryId,
}: {
  menuCategoryId: string;
}): Promise<MenuCategoryWithImage> => {
  try {
    const menuCategory = await prisma.menuCategory.findUnique({
      where: { id: menuCategoryId },
      include: { image: true },
    });
    if (!menuCategory) {
      throw new AppError("Menu category not found", 404);
    }
    const image = await cloudinaryService.getSecureUrl(
      menuCategory.image?.publicId!,
    );

    return { ...menuCategory, image };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get menu category", 500);
  }
};

export const deleteMenuCategoryService = async ({
  menuCategoryId,
}: {
  menuCategoryId: string;
}): Promise<{ message: string }> => {
  try {
    const menuCategory = await prisma.menuCategory.delete({
      where: { id: menuCategoryId },
    });
    if (!menuCategory) {
      throw new AppError("Menu category not found", 404);
    }
    return { message: "Menu category deleted successfully" };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete menu category", 500);
  }
};

export const createMenuItemService = async ({
  restaurantId,
  categoryId,
  name,
  description,
  price,
  isVeg,
  isAvailable,
  prepTimeMins,
  calories,
  allergens,
  tags,
  image,
  sortOrder,
}: {
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMins: number;
  calories?: number;
  allergens: string[];
  tags: string[];
  image: string;
  sortOrder: number;
}): Promise<MenuItem> => {
  try {
    const category = await prisma.menuCategory.findFirst({
      where: { id: categoryId, restaurantId },
    });
    if (!category) {
      throw new AppError("Menu category not found for this restaurant", 404);
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description: description ?? null,
        price,
        isVeg,
        isAvailable,
        prepTimeMins,
        ...(calories !== undefined && { calories }),
        allergens,
        tags,
        image,
        sortOrder,
        restaurant: { connect: { id: restaurantId } },
        category: { connect: { id: categoryId } },
      },
    });
    if (!menuItem) {
      throw new AppError("Failed to create menu item", 400);
    }
    return menuItem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create menu item", 500);
  }
};

export const getMenuItemsByRestaurantIdService = async ({
  restaurantId,
  categoryId,
  offset,
  limit,
  search,
  orderBy,
  orderDirection,
  isVeg,
  isAvailable,
}: {
  restaurantId?: string;
  categoryId?: string;
  offset: number;
  limit: number;
  search: string;
  orderBy: string;
  orderDirection: "asc" | "desc";
  isVeg?: boolean;
  isAvailable?: boolean;
}): Promise<{ menuItems: MenuItem[]; total: number }> => {
  try {
    const where: Prisma.MenuItemWhereInput = {
      ...(restaurantId && { restaurantId }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(isVeg !== undefined && { isVeg }),
      ...(isAvailable !== undefined && { isAvailable }),
    };

    const [menuItems, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
        include: { category: true },
      }),
      prisma.menuItem.count({ where }),
    ]);

    return { menuItems, total };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get menu items", 500);
  }
};

export const getMenuItemByIdService = async ({
  menuItemId,
}: {
  menuItemId: string;
}): Promise<MenuItem> => {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { category: true },
    });
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    return menuItem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get menu item", 500);
  }
};

export const deleteMenuItemService = async ({
  menuItemId,
}: {
  menuItemId: string;
}): Promise<{ message: string }> => {
  try {
    const menuItem = await prisma.menuItem.delete({
      where: { id: menuItemId },
    });
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    return { message: "Menu item deleted successfully" };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete menu item", 500);
  }
};

export const updateMenuItemService = async ({
  menuItemId,
  data,
  imageId,
}: {
  menuItemId: string;
  data: Prisma.MenuItemUpdateInput;
  imageId?: string;
}): Promise<MenuItem> => {
  try {
    const menuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        ...data,
        ...(imageId && { imageId }),
      },
    });
    if (!menuItem) {
      throw new AppError("Menu item not found", 404);
    }
    return menuItem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update menu item", 500);
  }
};
