import { Request, Response } from "express";
import { z } from "zod";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  createAddonGroupService,
  createAddonService,
  deleteAddonGroupService,
  deleteAddonService,
  getAddonByIdService,
  getAddonGroupByIdService,
  getAddonsByGroupIdService,
  getAllAddonGroupsService,
  updateAddonGroupService,
  updateAddonService,
} from "./addon.services.js";
import {
  createAddonGroupSchema,
  createAddonSchema,
  updateAddonGroupSchema,
  updateAddonSchema,
} from "./schema.js";

const handleControllerError = (res: Response, error: unknown) => {
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
    message: "Internal server error",
    statusCode: 500,
    error: "Internal server error",
  });
};

export const createAddonGroup = async (req: Request, res: Response) => {
  try {
    const validatedData = createAddonGroupSchema.parse(req.body);

    const addonGroup = await createAddonGroupService(validatedData);
    return apiResponseUtils.success({
      res,
      message: "Addon group created successfully",
      data: addonGroup,
      statusCode: 201,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAllAddonGroups = async (req: Request, res: Response) => {
  try {
    const { offset, limit, search, orderBy, orderDirection } = req.query as {
      offset?: number;
      limit?: number;
      search?: string;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
    };

    const { addonGroups, total } = await getAllAddonGroupsService({
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      search: search ?? "",
      orderBy: orderBy ?? "name",
      orderDirection: orderDirection ?? "asc",
    });

    return apiResponseUtils.paginated({
      res,
      message: "Addon groups retrieved successfully",
      results: addonGroups,
      total,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAddonGroupById = async (req: Request, res: Response) => {
  try {
    const { addonGroupId } = req.params;
    if (!addonGroupId) {
      throw new AppError("Addon group ID is required", 400);
    }

    const addonGroup = await getAddonGroupByIdService({
      addonGroupId: addonGroupId as string,
    });
    return apiResponseUtils.success({
      res,
      message: "Addon group retrieved successfully",
      data: addonGroup,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updateAddonGroup = async (req: Request, res: Response) => {
  try {
    const { addonGroupId } = req.params;
    if (!addonGroupId) {
      throw new AppError("Addon group ID is required", 400);
    }

    const validatedData = updateAddonGroupSchema.parse(req.body);
    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([, v]) => v !== undefined),
    );

    const addonGroup = await updateAddonGroupService({
      addonGroupId: addonGroupId as string,
      data,
    });

    return apiResponseUtils.success({
      res,
      message: "Addon group updated successfully",
      data: addonGroup,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const deleteAddonGroup = async (req: Request, res: Response) => {
  try {
    const { addonGroupId } = req.params;
    if (!addonGroupId) {
      throw new AppError("Addon group ID is required", 400);
    }

    const result = await deleteAddonGroupService({
      addonGroupId: addonGroupId as string,
    });
    return apiResponseUtils.success({
      res,
      message: result.message,
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const createAddon = async (req: Request, res: Response) => {
  try {
    const validatedData = createAddonSchema.parse({
      ...req.body,
    });

    const addon = await createAddonService(validatedData);
    return apiResponseUtils.success({
      res,
      message: "Addon created successfully",
      data: addon,
      statusCode: 201,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAddons = async (req: Request, res: Response) => {
  try {
    const {
      offset,
      limit,
      search,
      orderBy,
      orderDirection,
      isAvailable,
      addonGroupId,
    } = req.query as {
      addonGroupId?: string;
      offset?: number;
      limit?: number;
      search?: string;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
      isAvailable?: string;
    };

    const { addons, total } = await getAddonsByGroupIdService({
      ...(addonGroupId && { addonGroupId: addonGroupId as string }),
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      search: search ?? "",
      orderBy: orderBy ?? "name",
      orderDirection: orderDirection ?? "asc",
      ...(isAvailable !== undefined && { isAvailable: isAvailable === "true" }),
    });

    return apiResponseUtils.paginated({
      res,
      message: "Addons retrieved successfully",
      results: addons,
      total,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAddonById = async (req: Request, res: Response) => {
  try {
    const { addonId } = req.params;
    if (!addonId) {
      throw new AppError("Addon ID is required", 400);
    }

    const addon = await getAddonByIdService({
      addonId: addonId as string,
    });

    return apiResponseUtils.success({
      res,
      message: "Addon retrieved successfully",
      data: addon,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updateAddon = async (req: Request, res: Response) => {
  try {
    const { addonId } = req.params;
    if (!addonId) {
      throw new AppError("Addon ID is required", 400);
    }

    const validatedData = updateAddonSchema.parse(req.body);
    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([, v]) => v !== undefined),
    );

    const addon = await updateAddonService({
      addonId: addonId as string,
      data,
    });

    return apiResponseUtils.success({
      res,
      message: "Addon updated successfully",
      data: addon,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const deleteAddon = async (req: Request, res: Response) => {
  try {
    const { addonId } = req.params;
    if (!addonId) {
      throw new AppError("Addon ID is required", 400);
    }

    const result = await deleteAddonService({
      addonId: addonId as string,
    });
    return apiResponseUtils.success({
      res,
      message: result.message,
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
