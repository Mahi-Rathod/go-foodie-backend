import { Request, Response } from "express";
import { z } from "zod";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  addToCartService,
  deleteCartItemService,
  getCartService,
  updateCartItemService,
} from "./cart.services.js";
import { addToCartSchema, updateCartItemSchema } from "./schema.js";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    if (!id) {
      throw new AppError("Unauthorized", 401);
    }
    const validatedData = addToCartSchema.parse({
      ...req.body,
    });

    const cartItem = await addToCartService({
      userId: id,
      ...validatedData,
    });
    if (!cartItem) {
      throw new AppError("Failed to add to cart", 500);
    }
    return apiResponseUtils.success({
      res,
      message: "Item added to cart successfully",
      data: cartItem,
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error instanceof z.ZodError ? error.message : null,
      });
    }
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

export const getCartItems = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    if (!id) {
      throw new AppError("Unauthorized", 401);
    }
    const cart = await getCartService(id);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }
    return apiResponseUtils.success({
      res,
      message: "Cart items retrieved successfully",
      data: cart,
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

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { cartItemId } = req.params;

    if (!cartItemId) {
      throw new AppError("Cart item ID is required", 400);
    }

    const validatedData = updateCartItemSchema.parse(req.body);

    const cartItem = await updateCartItemService(
      cartItemId as string,
      {
        ...validatedData,
      } as {
        quantity?: number;
        variants?: string[];
        addons?: string[];
      },
    );

    if (!cartItem) {
      throw new AppError("Failed to update cart item", 500);
    }
    return apiResponseUtils.success({
      res,
      message: "Cart item updated successfully",
      data: cartItem,
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
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { cartItemId } = req.params;

    if (!cartItemId) {
      throw new AppError("Cart item ID is required", 400);
    }
    const message = await deleteCartItemService(cartItemId as string);
    return apiResponseUtils.success({
      res,
      message: message?.message || "Cart item removed successfully",
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
