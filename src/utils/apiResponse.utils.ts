import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types/api.types.js";

class APIResponseUtils {
  private baseUrl = process.env.API_URL || "http://localhost:5000";

  success<T>({
    res,
    message,
    data,
    statusCode,
  }: {
    res: Response;
    message: string;
    data?: T;
    statusCode: number;
  }): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  paginated<T>({
    res,
    message,
    results,
    total,
    page,
    limit,
    statusCode,
  }: {
    res: Response;
    message: string;
    results: T[];
    total: number;
    page: number;
    limit: number;
    statusCode: number;
  }): Response<PaginatedResponse<T>> {
    return res.status(statusCode).json({
      success: true,
      message,
      results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      nextPage:
        page < Math.ceil(total / limit)
          ? `${this.baseUrl}/api/?page=${page + 1}&limit=${limit}`
          : null,
      previousPage:
        page > 1
          ? `${this.baseUrl}/api/?page=${page - 1}&limit=${limit}`
          : null,
    });
  }

  error({
    res,
    message,
    statusCode,
    error,
  }: {
    res: Response;
    message: string;
    statusCode: number;
    error: string | null;
  }): Response<ApiResponse<null>> {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}

export const apiResponseUtils = new APIResponseUtils();
