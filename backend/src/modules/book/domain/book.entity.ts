export interface Book {
  id: number;
  title: string;
  author: string;
  publisher?: string | null;
  edition?: string | null;
  stock: number;
  price: number;
}