import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private endpoint = '/api/categories';

  constructor(private apiService: ApiService) { }

  getAllCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>(this.endpoint);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.apiService.get<Category>(`${this.endpoint}/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.apiService.post<Category>(this.endpoint, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.apiService.put<Category>(`${this.endpoint}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.apiService.delete(`${this.endpoint}/${id}`);
  }

  // Opcionales según backend
  deleteCategoryPhysically(id: number): Observable<void> {
    return this.apiService.delete(`${this.endpoint}/physically/${id}`);
  }

  restoreCategory(id: number): Observable<Category> {
    return this.apiService.put<Category>(`${this.endpoint}/restore/${id}`, {});
  }

  getCategoriesByStatus(status: string): Observable<Category[]> {
    return this.apiService.get<Category[]>(`${this.endpoint}/status/${status}`);
  }

  searchCategories(term: string): Observable<Category[]> {
    return this.apiService.get<Category[]>(`${this.endpoint}/search?term=${term}`);
  }
}
