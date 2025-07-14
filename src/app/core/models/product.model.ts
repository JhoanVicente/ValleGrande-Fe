import { Category } from './category.model';

export interface Product {
  id?: number;              // ID opcional, ya que se genera en backend
  name: string;             // Nombre del producto, obligatorio
  description: string;      // Descripción detallada
  price: number;            // Precio, tipo numérico para operaciones y formatos monetarios
  status: boolean;          // Estado activo/inactivo, para gestión de disponibilidad
  imageUrl: string;         // URL de imagen, puede validarse para asegurar formato correcto
  category?: Category;      // Objeto categoría, relación directa, ahora es opcional
  createdAt?: string;       // Fecha creación en formato ISO string, opcional y readonly
  quantity?: number;        // Propiedad opcional para la cantidad seleccionada
}
