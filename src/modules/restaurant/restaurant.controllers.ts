import { Request, Response } from "express";
import { z } from "zod";
import { RESTAURANT_STATUS } from "../../generated/prisma/client.js";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  applyForRestaurantService,
  documentUploadService,
  getAllRestaurantsService,
  getRestaurantByIdService,
  getRestaurantDocumentsService,
  getRestaurantsByUserIdService,
  submitRestaurantBankDetailsService,
  toggleRestaurantOpenService,
  updateRestaurantDetailsService,
} from "./restaurant.services.js";

import {
  ApplyForRestaurantSchema,
  BankDetailsSchema,
  UpdateRestaurantSchema,
} from "./schemas.js";

import { DOCUMENT_STATUS } from "../../generated/prisma/enums.js";
import {
  updateRestaurantDocumentStatusService,
  updateRestaurantStatusService,
} from "./restaurant.services.js";

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

export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const { offset, limit, status, city, search } = req.query as {
      offset?: string;
      limit?: string;
      status?: RESTAURANT_STATUS;
      city?: string;
      search?: string;
    };

    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const { restaurants, total } = await getAllRestaurantsService({
      offset: parsedOffset,
      limit: parsedLimit,
      ...(status && { status }),
      ...(city && { city }),
      ...(search && { search }),
    });

    return apiResponseUtils.paginated({
      res,
      message: "Restaurants retrieved successfully",
      results: restaurants,
      total,
      offset: Number(offset || 0),
      limit: parsedLimit,
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
      message: "Failed to retrieve restaurants",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

export const getMyRestaurants = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const restaurants = await getRestaurantsByUserIdService(id);

    return apiResponseUtils.success({
      res,
      message: "Your restaurants retrieved successfully",
      data: restaurants,
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
      message: "Failed to retrieve your restaurants",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

export const updateRestaurantDetails = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params as { restaurantId: string };
    const { id: ownerId } = req.user;
    const validatedData = UpdateRestaurantSchema.parse(req.body);

    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([, v]) => v !== undefined),
    ) as Parameters<typeof updateRestaurantDetailsService>[0]["data"];

    const restaurant = await updateRestaurantDetailsService({
      restaurantId,
      ownerId,
      data,
    });

    return apiResponseUtils.success({
      res,
      message: "Restaurant details updated successfully",
      data: restaurant,
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
      message: "Failed to update restaurant details",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

export const toggleRestaurantOpen = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params as { restaurantId: string };
    const { id: ownerId } = req.user;

    const restaurant = await toggleRestaurantOpenService({
      restaurantId,
      ownerId,
    });

    return apiResponseUtils.success({
      res,
      message: `Restaurant is now ${restaurant.isOpen ? "open" : "closed"}`,
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
      message: "Failed to toggle restaurant open status",
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

//Controllers for admin

export const getRestaurantsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const restaurants = await getRestaurantsByUserIdService(userId);

    return apiResponseUtils.success({
      res,
      message: "Restaurants retrieved successfully",
      data: restaurants,
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
      message: "Failed to retrieve restaurants",
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
