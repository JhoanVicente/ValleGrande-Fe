export interface Category {
  id: number;
  name: string;
  status?: string;
}

export interface Product {
  id?: number;          // opcional para crear (no obligatorio enviar id)
  name: string;
  description?: string;
  price: number;
  status?: string;      // 'A', 'E', etc.
  imageUrl?: string;
  category: Category;
  createdAt?: string;   // fecha en formato ISO string
}
