export interface Language {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguageData {
  description: string;
  isActive?: boolean;
}

export interface UpdateLanguageData {
  description?: string;
  isActive?: boolean;
}
