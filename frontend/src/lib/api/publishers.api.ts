import type { Publisher, CreatePublisherData, UpdatePublisherData } from '@/types';
import { apiClient } from './client';

export async function listPublishers(): Promise<Publisher[]> {
  const { data } = await apiClient.get<Publisher[]>('/publishers');
  return data;
}

export async function createPublisher(payload: CreatePublisherData): Promise<Publisher> {
  const { data } = await apiClient.post<Publisher>('/publishers', payload);
  return data;
}

export async function updatePublisher(id: number, payload: UpdatePublisherData): Promise<Publisher> {
  const { data } = await apiClient.patch<Publisher>(`/publishers/${id}`, payload);
  return data;
}

export async function deletePublisher(id: number): Promise<void> {
  await apiClient.delete(`/publishers/${id}`);
}
