import { Request, Response } from "express";
import { z } from "zod";
import { UserUpdateInput } from "../../generated/prisma/models.js";
import { AddressInput } from "../../types/user.types.js";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import { AddressInputSchema, AddressUpdateSchema } from "./schemas.js";
import {
  addUserAddressService,
  deleteAllAddressesService,
  deleteUserAddressService,
  deleteUserProfileService,
  getAllUsersService,
  getUserByIdService,
  updateUserAddressService,
  updateUserProfileService,
} from "./user.services.js";

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      throw new AppError("User ID is required", 400);
    }

    const user = await updateUserProfileService({
      id,
      updatedUserData: req.body as UserUpdateInput,
    });

    apiResponseUtils.success({
      res,
      message: "User profile updated successfully",
      data: user,
      statusCode: 200,
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

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      throw new AppError("User ID is required", 400);
    }
    const user = await getUserByIdService(id);

    apiResponseUtils.success({
      res,
      message: "User profile fetched successfully",
      data: user,
      statusCode: 200,
    });
  } catch (error) {
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

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { offset, limit, search } = req.query;

    const users = await getAllUsersService({
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      search: (search as string) || "",
    });

    apiResponseUtils.paginated({
      res,
      message: "Users fetched successfully",
      results: users.results,
      total: users.total,
      page: 1,
      limit: users.limit,
      statusCode: 200,
    });
  } catch (error) {
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

export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const message = await deleteUserProfileService({ id });
    apiResponseUtils.success({
      res,
      message: message?.message || "User profile deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
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

export const addUserAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    if (!id) {
      throw new AppError("Unauthorized", 401);
    }

    const validatedData = AddressInputSchema.parse(req.body);

    const address = await addUserAddressService({
      userId: id as string,
      ...validatedData,
    } as AddressInput);

    apiResponseUtils.success({
      res,
      message: "Address added successfully",
      data: address,
      statusCode: 200,
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

export const updateUserAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      throw new AppError("Address ID is required", 400);
    }

    const newAddress = AddressUpdateSchema.parse(req.body) as AddressInput;

    const address = await updateUserAddressService({ id, newAddress });

    apiResponseUtils.success({
      res,
      message: "Address updated successfully",
      data: address,
      statusCode: 200,
    });
  } catch (error) {
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

export const deleteUserAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      throw new AppError("Address ID is required", 400);
    }
    const message = await deleteUserAddressService({ id });

    apiResponseUtils.success({
      res,
      message: message?.message || "Address deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
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

export const deleteAllAddresses = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    if (!id) {
      throw new AppError("Unauthorized", 401);
    }
    const message = await deleteAllAddressesService({ userId: id });
    apiResponseUtils.success({
      res,
      message: message?.message || "All addresses deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
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
