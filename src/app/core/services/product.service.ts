import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Obtener todos los productos (solo activos, según la implementación del backend)
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, this.httpOptions);
  }

  // Obtener un producto por ID
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  // Crear un nuevo producto
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, this.httpOptions);
  }

  // Actualizar un producto
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, this.httpOptions);
  }

  // Eliminar un producto (cambio de estado a inactivo)
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  // Obtener productos inactivos
  getInactiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/inactive`, this.httpOptions);
  }

  // Obtener todos los productos (activos e inactivos)
  getAllProducts(): Observable<Product[]> {
    return forkJoin([this.getProducts(), this.getInactiveProducts()]).pipe(
      map(([activeProducts, inactiveProducts]) => [...activeProducts, ...inactiveProducts])
    );
  }

  deleteProductPhysically(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/physically/${id}`, this.httpOptions);
  }

  restoreProduct(id: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/restore/${id}`, {}, this.httpOptions);
  }

  // Descargar reporte de productos activos en PDF
  downloadActiveProductsReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/report/pdf?estado=1`, { 
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }

  // Descargar reporte de productos inactivos en PDF
  downloadInactiveProductsReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/report/pdf?estado=0`, { 
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf'
      })
    });
  }

  // Método para compatibilidad con pruebas unitarias
  getAll(): Observable<Product[]> {
    return this.getProducts();
  }
}