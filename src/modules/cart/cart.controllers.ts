import { Request, Response } from "express";
import { z } from "zod";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import { addToCartService, getCartService } from "./cart.services.js";
import { addToCartSchema } from "./schema.js";

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
