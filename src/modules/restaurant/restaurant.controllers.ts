import { Request, Response } from "express";
import { z } from "zod";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  applyForRestaurantService,
  submitRestaurantBankDetailsService,
} from "./restaurant.services.js";
import { ApplyForRestaurantSchema, BankDetailsSchema } from "./schemas.js";

export const applyForRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const validatedData = ApplyForRestaurantSchema.parse(req.body);

    const restaurant = await applyForRestaurantService({
      userId: id,
      data: {
        ...validatedData,
        latitude: validatedData.latitude ?? null,
        longitude: validatedData.longitude ?? null,
      },
    });

    if (!restaurant) {
      throw new AppError("Failed to apply for restaurant", 400);
    }

    apiResponseUtils.success({
      res,
      message: "Restaurant applied successfully",
      data: restaurant,
      statusCode: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }

    apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const submitRestaurantBankDetails = async (
  req: Request,
  res: Response,
) => {
  try {
    const { restaurantId } = req.params;
    const validatedData = BankDetailsSchema.parse(req.body);

    const { bankDetails, restaurant } =
      await submitRestaurantBankDetailsService({
        restaurantId: restaurantId as string,
        data: validatedData,
      });

    apiResponseUtils.success({
      res,
      message: "Restaurant bank details submitted successfully",
      data: { bankDetails, restaurant },
      statusCode: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      apiResponseUtils.error({
        res,
        message: "Validation error",
        statusCode: 400,
        error: error.message,
      });
    }

    apiResponseUtils.error({
      res,
      message:
        error instanceof AppError ? error.message : "Internal server error",
      statusCode: error instanceof AppError ? error.statusCode : 500,
      error:
        error instanceof AppError ? error.message : "Internal server error",
    });
  }
};

export const uploadRestaurantDocuments = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.user;
  const { restaurantId } = req.params;

  const documents = req.files as any;
  const documentNames = Object.keys(documents);
  console.log(documentNames);

  return apiResponseUtils.success({
    res,
    message: "Restaurant documents uploaded successfully",
    data: documents,
    statusCode: 200,
  });
};
