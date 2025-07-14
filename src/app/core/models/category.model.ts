export interface Category {
  id?: number;
  name: string;
  status: 'A' | 'I' | 'E'; // Añadir 'E' para Eliminado lógicamente, según el backend
  description?: string; // Opcional, agrega si tu backend maneja descripción
}
