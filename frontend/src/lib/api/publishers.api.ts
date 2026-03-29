import type { Publisher, CreatePublisherPayload, UpdatePublisherPayload, ApiResponse, PaginatedResponse, ListPublishersFilters } from '@/types';
import { apiClient } from './client';

export async function listPublishers(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListPublishersFilters
): Promise<PaginatedResponse<Publisher>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Publisher>>>('/publishers', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });

  return data.data;
}

export async function createPublisher(payload: CreatePublisherPayload): Promise<Publisher> {
  const { data } = await apiClient.post<ApiResponse<Publisher>>('/publishers', payload);
  return data.data;
}

export async function updatePublisher(id: number, payload: UpdatePublisherPayload): Promise<Publisher> {
  const { data } = await apiClient.put<ApiResponse<Publisher>>(`/publishers/${id}`, payload);
  return data.data;
}

export async function deletePublisher(id: number): Promise<void> {
  await apiClient.delete(`/publishers/${id}`);
}
