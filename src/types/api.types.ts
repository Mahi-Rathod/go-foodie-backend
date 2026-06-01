interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | null;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  results: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  nextPage: string | null;
  previousPage: string | null;
}

export type { ApiResponse, PaginatedResponse };
