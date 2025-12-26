/**
 * Pagination metadata returned by the API
 */
export interface PageInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  page_info: PageInfo;
}
