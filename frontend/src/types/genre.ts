export interface Genre {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGenreData {
  description: string;
  isActive?: boolean;
}

export interface UpdateGenreData {
  description?: string;
  isActive?: boolean;
}
