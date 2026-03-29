export interface Genre {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface CreateGenrePayload {
  description: string;
  isActive?: boolean;
}

export interface UpdateGenrePayload {
  description?: string;
  isActive?: boolean;
}

export interface ListGenresFilters {
  search?: string;
  isActive?: boolean;
}