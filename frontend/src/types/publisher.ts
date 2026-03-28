export interface Publisher {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublisherData {
  description: string;
  isActive?: boolean;
}

export interface UpdatePublisherData {
  description?: string;
  isActive?: boolean;
}
