export class ExternalBookLookupDto {
  title: string;
  subtitle?: string | null;
  authors: string[];
  publisher?: string | null;
  publisherId?: number | null;
  language?: string | null;
  languageId?: number | null;
  genreId?: number | null;
  isbn10?: string | null;
  isbn13?: string | null;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  coverUrl?: string | null;
  subjects?: string[] | null;
}
