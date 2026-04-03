import type { Publisher, CreatePublisherPayload, UpdatePublisherPayload, PaginatedResponse, ListPublishersFilters } from '@/types';
import { apiClient } from './client';

export async function listPublishers(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  filters?: ListPublishersFilters
): Promise<PaginatedResponse<Publisher>> {
  const { data } = await apiClient.get<PaginatedResponse<Publisher>>('/publishers', {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters?.search,
      isActive: filters?.isActive,
    },
  });

  return data;
}

export async function createPublisher(payload: CreatePublisherPayload): Promise<Publisher> {
  const { data } = await apiClient.post<Publisher>('/publishers', payload);
  return data;
}

export async function updatePublisher(id: number, payload: UpdatePublisherPayload): Promise<Publisher> {
  const { data } = await apiClient.put<Publisher>(`/publishers/${id}`, payload);
  return data;
}

export async function deletePublisher(id: number): Promise<void> {
  await apiClient.delete(`/publishers/${id}`);
}
