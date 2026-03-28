export interface Language {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface CreateLanguagePayload {
  description: string;
  isActive?: boolean;
}

export interface UpdateLanguagePayload {
  description?: string;
  isActive?: boolean;
}

export interface ListLanguagesFilters {
  search?: string;
  isActive?: boolean;
}