import { Request, Response } from "express";
import { z } from "zod";
import { imageService } from "../../services/image.service.js";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  createMenuCategoryService,
  createMenuItemService,
  deleteMenuCategoryService,
  deleteMenuItemService,
  getMenuCategoriesByRestaurantIdService,
  getMenuCategoryByIdService,
  getMenuItemByIdService,
  getMenuItemsByRestaurantIdService,
  updateMenuItemService,
} from "./menu.services.js";
import {
  createMenuCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from "./schema.js";

export const createMenuCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = createMenuCategorySchema.parse(req.body);
    const file = req.file;
    if (!file) {
      throw new AppError("Image is required", 400);
    }
    const uploadedImage = await imageService.upload(file);
    if (!uploadedImage.secureUrl) {
      throw new AppError("Failed to upload image", 500);
    }
    const { imageId, secureUrl } = uploadedImage;

    const menuCategory = await createMenuCategoryService({
      restaurantId: validatedData.restaurantId,
      name: validatedData.name,
      description: validatedData.description ?? "",
      sortOrder: validatedData.sortOrder ?? 0,
      isActive: validatedData.isActive,
      imageId: imageId,
    });

    return apiResponseUtils.success({
      res,
      message: "Menu category created successfully",
      data: { ...menuCategory, image: secureUrl },
      statusCode: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
    return apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: 400,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const getAllMenuCategories = async (req: Request, res: Response) => {
  try {
    const {
      restaurantId,
      offset,
      limit,
      search,
      orderBy,
      orderDirection,
      isActive,
      sortOrder,
    } = req.query as {
      restaurantId?: string;
      offset?: number;
      limit?: number;
      search?: string;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
      isActive?: string;
      sortOrder?: number;
    };

    if (!restaurantId) {
      throw new AppError("Restaurant ID is required", 400);
    }
    const { menuCategories, total } =
      await getMenuCategoriesByRestaurantIdService({
        restaurantId: restaurantId as string,
        offset: Number(offset || 0),
        limit: Number(limit || 10),
        search: search ?? "",
        orderBy: orderBy ?? "createdAt",
        orderDirection: orderDirection ?? "asc",
        isActive: isActive !== undefined ? isActive === "true" : true,
        sortOrder: sortOrder ?? 0,
      });

    return apiResponseUtils.paginated({
      res,
      message: "Menu categories retrieved successfully",
      results: menuCategories,
      total: total,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      statusCode: 200,
    });
  } catch (error) {
    return apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const getMenuCategoryById = async (req: Request, res: Response) => {
  try {
    const { menuCategoryId } = req.params;
    if (!menuCategoryId) {
      throw new AppError("Menu category ID is required", 400);
    }
    const menuCategory = await getMenuCategoryByIdService({
      menuCategoryId: menuCategoryId as string,
    });
    if (!menuCategory) {
      throw new AppError("Menu category not found", 404);
    }
    return apiResponseUtils.success({
      res,
      message: "Menu category retrieved successfully",
      data: menuCategory,
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return apiResponseUtils.error({
        res,
        message: error.message,
        statusCode: error.statusCode,
        error: error.message,
      });
    }
    return apiResponseUtils.error({
      res,
      message: "Internal server error",
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

export const deleteMenuCategory = async (req: Request, res: Response) => {
  try {
    const { menuCategoryId } = req.params;
    if (!menuCategoryId) {
      throw new AppError("Menu category ID is required", 400);
    }
    const message = await deleteMenuCategoryService({
      menuCategoryId: menuCategoryId as string,
    });
    return apiResponseUtils.success({
      res,
      message: message?.message || "Menu category deleted successfully",
      statusCode: 200,
      data: message,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return apiResponseUtils.error({
        res,
        message: error.message,
        statusCode: error.statusCode,
        error: error.message,
      });
    }
  }
};

//Items
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const validatedData = createMenuItemSchema.parse(req.body);
    const file = req.file;
    if (!file) {
      throw new AppError("Image is required", 400);
    }
    const uploadedImage = await imageService.upload(file);
    if (!uploadedImage.secureUrl) {
      throw new AppError("Failed to upload image", 500);
    }
    const { secureUrl } = uploadedImage;

    const menuItem = await createMenuItemService({
      restaurantId: validatedData.restaurantId,
      categoryId: validatedData.categoryId,
      name: validatedData.name,
      description: validatedData.description ?? null,
      price: validatedData.price,
      isVeg: validatedData.isVeg,
      isAvailable: validatedData.isAvailable,
      prepTimeMins: validatedData.prepTimeMins,
      ...(validatedData.calories !== undefined && {
        calories: validatedData.calories,
      }),
      allergens: validatedData.allergens,
      tags: validatedData.tags,
      image: secureUrl,
      sortOrder: validatedData.sortOrder,
    });

    return apiResponseUtils.success({
      res,
      message: "Menu item created successfully",
      data: menuItem,
      statusCode: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
    return apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const {
      restaurantId,
      categoryId,
      offset,
      limit,
      search,
      orderBy,
      orderDirection,
      isVeg,
      isAvailable,
    } = req.query as {
      restaurantId?: string;
      categoryId?: string;
      offset?: number;
      limit?: number;
      search?: string;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
      isVeg?: string;
      isAvailable?: string;
    };

    const { menuItems, total } = await getMenuItemsByRestaurantIdService({
      restaurantId: restaurantId as string,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      search: search ?? "",
      orderBy: orderBy ?? "createdAt",
      orderDirection: orderDirection ?? "asc",
      ...(categoryId && { categoryId }),
      ...(isVeg !== undefined && { isVeg: isVeg === "true" }),
      ...(isAvailable !== undefined && { isAvailable: isAvailable === "true" }),
    });

    return apiResponseUtils.paginated({
      res,
      message: "Menu items retrieved successfully",
      results: menuItems,
      total,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      statusCode: 200,
    });
  } catch (error) {
    return apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;
    if (!menuItemId) {
      throw new AppError("Menu item ID is required", 400);
    }
    const menuItem = await getMenuItemByIdService({
      menuItemId: menuItemId as string,
    });
    return apiResponseUtils.success({
      res,
      message: "Menu item retrieved successfully",
      data: menuItem,
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return apiResponseUtils.error({
        res,
        message: error.message,
        statusCode: error.statusCode,
        error: error.message,
      });
    }
    return apiResponseUtils.error({
      res,
      message: "Internal server error",
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;
    if (!menuItemId) {
      throw new AppError("Menu item ID is required", 400);
    }
    const message = await deleteMenuItemService({
      menuItemId: menuItemId as string,
    });
    return apiResponseUtils.success({
      res,
      message: message?.message || "Menu item deleted successfully",
      statusCode: 200,
      data: message,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return apiResponseUtils.error({
        res,
        message: error.message,
        statusCode: error.statusCode,
        error: error.message,
      });
    }
    return apiResponseUtils.error({
      res,
      message: "Internal server error",
      statusCode: 500,
      error: "Internal server error",
    });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params;
    if (!menuItemId) {
      throw new AppError("Menu item ID is required", 400);
    }
    const validatedData = updateMenuItemSchema.parse(req.body);

    const file = req.file;

    let image: { secureUrl: string; imageId: string } | undefined;

    if (file) {
      const uploadedImage = await imageService.upload(file);
      if (!uploadedImage.secureUrl) {
        throw new AppError("Failed to upload image", 500);
      }
      image = uploadedImage;
    }

    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([, v]) => v !== undefined),
    ) as Parameters<typeof updateMenuItemService>[0]["data"];

    const menuItem = await updateMenuItemService({
      menuItemId: menuItemId as string,
      data,
      ...(image && { imageId: image.imageId }),
    });
    return apiResponseUtils.success({
      res,
      message: "Menu item updated successfully",
      data: menuItem,
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }
    return apiResponseUtils.error({
      res,
      message: "Internal server error",
      statusCode: 500,
      error: "Internal server error",
    });
  }
};
