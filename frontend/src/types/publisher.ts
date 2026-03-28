export interface Publisher {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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