import { Request, Response } from "express";
import { z } from "zod";
import { ORDER_STATUS } from "../../generated/prisma/enums.js";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  createOrdersService,
  getOrderByIdService,
  getOrdersByRestaurantIdService,
  getOrdersByUserIdService,
  updateOrderStatusService,
} from "./order.services.js";
import { createOrderSchema } from "./schema.js";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const validatedData = createOrderSchema.parse({
      ...req.body,
    });

    const placedOrders = await createOrdersService({
      userId: id,
      ...validatedData,
    });

    return apiResponseUtils.success({
      res,
      message: "Orders placed successfully",
      data: placedOrders,
      statusCode: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponseUtils.error({
        res,
        message: error.message,
        statusCode: 400,
        error: error instanceof z.ZodError ? error.message : null,
      });
    }
    return apiResponseUtils.error({
      res,
      message: error instanceof Error ? error.message : "Internal server error",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const orders = await getOrdersByUserIdService({
      userId: id,
    });
    return apiResponseUtils.success({
      res,
      message: "Orders retrieved successfully",
      data: orders,
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

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await getOrderByIdService({
      orderId: orderId as string,
    });
    return apiResponseUtils.success({
      res,
      message: "Order retrieved successfully",
      data: order,
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
  }
  return apiResponseUtils.error({
    res,
    message: "Internal server error",
    statusCode: 500,
    error: "Internal server error",
  });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatusService({
      orderId: orderId as string,
      status: status as ORDER_STATUS,
    });
    return apiResponseUtils.success({
      res,
      message: "Order status updated successfully",
      data: order,
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
  }
};

export const getOrderByRestaurantId = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { offset, limit, search } = req.query as {
      offset?: number;
      limit?: number;
      search?: string;
    };
    if (!restaurantId) {
      throw new AppError("Restaurant ID is required", 400);
    }
    const orders = await getOrdersByRestaurantIdService({
      restaurantId: restaurantId as string,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      search: search ?? "",
    });

    return apiResponseUtils.paginated({
      res,
      message: "Orders retrieved successfully",
      results: orders.orders,
      total: orders.total,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
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
  }
  return apiResponseUtils.error({
    res,
    message: "Internal server error",
    statusCode: 500,
    error: "Internal server error",
  });
};
