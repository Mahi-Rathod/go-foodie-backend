import { Request, Response } from "express";
import { z } from "zod";
import {
  DOCUMENT_STATUS,
  RESTAURANT_STATUS,
} from "../../generated/prisma/client.js";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  applyForRestaurantService,
  documentUploadService,
  getRestaurantByIdService,
  getRestaurantDocumentsService,
  submitRestaurantBankDetailsService,
  updateRestaurantDocumentStatusService,
  updateRestaurantStatusService,
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
  try {
    const { restaurantId } = req.params as { restaurantId: string };
    const file = req.file;
    const { documentType } = req.body;

    if (!file || !documentType) {
      throw new AppError("File and document type are required", 400);
    }

    const uploadedDocument = await documentUploadService({
      restaurantId: restaurantId,
      file,
      documentType,
    });

    return apiResponseUtils.success({
      res,
      message: "Restaurant documents uploaded successfully",
      data: uploadedDocument,
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
      message: "Failed to upload restaurant documents",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

export const getRestaurantDocuments = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params as { restaurantId: string };

    const documents = await getRestaurantDocumentsService({ restaurantId });

    return apiResponseUtils.success({
      res,
      message: "Restaurant documents retrieved successfully",
      data: documents,
      statusCode: 200,
    });
  } catch (error) {
    return apiResponseUtils.error({
      res,
      message: "Failed to retrieve restaurant documents",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

export const getRestaurantsById = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params as { restaurantId: string };
    const restaurant = await getRestaurantByIdService(restaurantId);

    return apiResponseUtils.success({
      res,
      message: "Restaurant details retrieved successfully",
      data: restaurant,
      statusCode: 200,
    });
  } catch (error) {
    return apiResponseUtils.error({
      res,
      message: "Failed to retrieve restaurant details",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

export const updateRestaurantStatus = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params as { restaurantId: string };
    const { status, note } = req.body as {
      status: RESTAURANT_STATUS;
      note?: string;
    };

    const restaurant = await updateRestaurantStatusService({
      restaurantId: restaurantId,
      status: status,
    });

    return apiResponseUtils.success({
      res,
      message: "Restaurant status updated successfully",
      data: restaurant,
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
      message: "Failed to update restaurant status",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

export const updateRestaurantDocumentStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { documentId } = req.params as { documentId: string };
    const { status, note } = req.body as {
      status: DOCUMENT_STATUS;
      note?: string;
    };

    if (!status) {
      throw new AppError("Status is required", 400);
    }

    const document = await updateRestaurantDocumentStatusService({
      documentId,
      status,
      note: note ?? "",
    });

    return apiResponseUtils.success({
      res,
      message: "Restaurant document status updated successfully",
      data: document,
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
      message: "Failed to update restaurant document status",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};
