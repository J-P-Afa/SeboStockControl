export interface Publisher {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePublisherPayload {
  description: string;
  isActive?: boolean;
}

export interface UpdatePublisherPayload {
  description?: string;
  isActive?: boolean;
}

export interface ListPublishersFilters {
  search?: string;
  isActive?: boolean;
}