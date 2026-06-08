import { Request, Response } from "express";
import { z } from "zod";
import { apiResponseUtils } from "../../utils/apiResponse.utils.js";
import { AppError } from "../../utils/app.error.js";
import {
  createVariantGroupService,
  createVariantService,
  deleteVariantGroupService,
  deleteVariantService,
  getAllVariantGroupsService,
  getVariantByIdService,
  getVariantGroupByIdService,
  getVariantsByGroupIdService,
  updateVariantGroupService,
  updateVariantService,
} from "./variant.services.js";
import {
  createVariantGroupSchema,
  createVariantSchema,
  updateVariantGroupSchema,
  updateVariantSchema,
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

export const createVariantGroup = async (req: Request, res: Response) => {
  try {
    const validatedData = createVariantGroupSchema.parse(req.body);

    const variantGroup = await createVariantGroupService(validatedData);
    return apiResponseUtils.success({
      res,
      message: "Variant group created successfully",
      data: variantGroup,
      statusCode: 201,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getAllVariantGroups = async (req: Request, res: Response) => {
  try {
    const { offset, limit, search, orderBy, orderDirection } = req.query as {
      offset?: number;
      limit?: number;
      search?: string;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
    };

    const { variantGroups, total } = await getAllVariantGroupsService({
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      search: search ?? "",
      orderBy: orderBy ?? "name",
      orderDirection: orderDirection ?? "asc",
    });

    return apiResponseUtils.paginated({
      res,
      message: "Variant groups retrieved successfully",
      results: variantGroups,
      total,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getVariantGroupById = async (req: Request, res: Response) => {
  try {
    const { variantGroupId } = req.params;
    if (!variantGroupId) {
      throw new AppError("Variant group ID is required", 400);
    }

    const variantGroup = await getVariantGroupByIdService({
      variantGroupId: variantGroupId as string,
    });
    return apiResponseUtils.success({
      res,
      message: "Variant group retrieved successfully",
      data: variantGroup,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updateVariantGroup = async (req: Request, res: Response) => {
  try {
    const { variantGroupId } = req.params;
    if (!variantGroupId) {
      throw new AppError("Variant group ID is required", 400);
    }

    const validatedData = updateVariantGroupSchema.parse(req.body);
    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([, v]) => v !== undefined),
    );

    const variantGroup = await updateVariantGroupService({
      variantGroupId: variantGroupId as string,
      data,
    });

    return apiResponseUtils.success({
      res,
      message: "Variant group updated successfully",
      data: variantGroup,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const deleteVariantGroup = async (req: Request, res: Response) => {
  try {
    const { variantGroupId } = req.params;
    if (!variantGroupId) {
      throw new AppError("Variant group ID is required", 400);
    }

    const result = await deleteVariantGroupService({
      variantGroupId: variantGroupId as string,
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

export const createVariant = async (req: Request, res: Response) => {
  try {
    const validatedData = createVariantSchema.parse({
      ...req.body,
    });

    const variant = await createVariantService(validatedData);
    return apiResponseUtils.success({
      res,
      message: "Variant created successfully",
      data: variant,
      statusCode: 201,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getVariants = async (req: Request, res: Response) => {
  try {
    const {
      offset,
      limit,
      search,
      orderBy,
      orderDirection,
      isAvailable,
      variantGroupId,
    } = req.query as {
      variantGroupId?: string;
      offset?: number;
      limit?: number;
      search?: string;
      orderBy?: string;
      orderDirection?: "asc" | "desc";
      isAvailable?: string;
    };

    const { variants, total } = await getVariantsByGroupIdService({
      ...(variantGroupId && { variantGroupId: variantGroupId as string }),
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      search: search ?? "",
      orderBy: orderBy ?? "name",
      orderDirection: orderDirection ?? "asc",
      ...(isAvailable !== undefined && { isAvailable: isAvailable === "true" }),
    });

    return apiResponseUtils.paginated({
      res,
      message: "Variants retrieved successfully",
      results: variants,
      total,
      offset: Number(offset || 0),
      limit: Number(limit || 10),
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const getVariantById = async (req: Request, res: Response) => {
  try {
    const { variantId } = req.params;
    if (!variantId) {
      throw new AppError("Variant ID is required", 400);
    }

    const variant = await getVariantByIdService({
      variantId: variantId as string,
    });

    return apiResponseUtils.success({
      res,
      message: "Variant retrieved successfully",
      data: variant,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { variantId } = req.params;
    if (!variantId) {
      throw new AppError("Variant ID is required", 400);
    }

    const validatedData = updateVariantSchema.parse(req.body);
    const data = Object.fromEntries(
      Object.entries(validatedData).filter(([, v]) => v !== undefined),
    );

    const variant = await updateVariantService({
      variantId: variantId as string,
      data,
    });

    return apiResponseUtils.success({
      res,
      message: "Variant updated successfully",
      data: variant,
      statusCode: 200,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const { variantId } = req.params;
    if (!variantId) {
      throw new AppError("Variant ID is required", 400);
    }

    const result = await deleteVariantService({
      variantId: variantId as string,
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
