import type { Publisher, CreatePublisherData, UpdatePublisherData, ApiResponse } from '@/types';
import { apiClient } from './client';

export async function listPublishers(): Promise<Publisher[]> {
  const { data } = await apiClient.get<ApiResponse<Publisher[]>>('/publishers');
  return data.data;
}

export async function createPublisher(payload: CreatePublisherData): Promise<Publisher> {
  const { data } = await apiClient.post<ApiResponse<Publisher>>('/publishers', payload);
  return data.data;
}

export async function updatePublisher(id: number, payload: UpdatePublisherData): Promise<Publisher> {
  const { data } = await apiClient.patch<ApiResponse<Publisher>>(`/publishers/${id}`, payload);
  return data.data;
}

export async function deletePublisher(id: number): Promise<void> {
  await apiClient.delete(`/publishers/${id}`);
}
