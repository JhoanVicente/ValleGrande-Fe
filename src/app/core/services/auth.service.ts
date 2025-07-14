import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { RestaurantUser } from '../models/restaurant-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_NAME = 'jwt_token';

  private currentUserSubject = new BehaviorSubject<RestaurantUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Fuente de verdad para el rol, extraído directamente del token.
  private userRoleSubject = new BehaviorSubject<string | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(
    map(user => !!user)
  );

  constructor(private apiService: ApiService, private router: Router) {
    this.loadUserOnAppStart();
  }

  private loadUserOnAppStart(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.userRoleSubject.next(this.getRoleFromToken(token)); // Cargar rol desde el token
      this.apiService.get<RestaurantUser>('/api/auth/me').pipe(
        catchError(() => {
          this.handleAuthError();
          return of(null);
        })
      ).subscribe(user => this.currentUserSubject.next(user));
    }
  }

  login(credentials: { username: string, password: string }): Observable<RestaurantUser> {
    return this.apiService.post<{ token: string }>('/api/auth/login', credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.saveToken(response.token);
          this.userRoleSubject.next(this.getRoleFromToken(response.token)); // Actualizar rol desde el token
        }
      }),
      switchMap(() => this.apiService.get<RestaurantUser>('/api/auth/me')),
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      catchError(err => {
        this.handleAuthError();
        return throwError(err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_NAME);
    this.currentUserSubject.next(null);
    this.userRoleSubject.next(null); // Limpiar el rol
    this.router.navigate(['/login']);
  }
  
  private handleAuthError(): void {
      localStorage.removeItem(this.TOKEN_NAME);
      this.currentUserSubject.next(null);
      this.userRoleSubject.next(null); // Limpiar el rol
  }

  private getRoleFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || null;
    } catch {
      return null;
    }
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_NAME, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_NAME);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const decoded: any = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  }

  register(userData: any): Observable<any> {
    return this.apiService.post<any>('/api/auth/register', userData);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      // Ajusta el nombre del claim según tu backend, por ejemplo: decoded.role o decoded.authorities
      return decoded.role || decoded.authorities || null;
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      // Busca específicamente el claim 'userId' que debería ser numérico
      const userId = decoded.userId;
      if (typeof userId === 'number') {
        return userId;
      }
      return null;
    } catch {
      return null;
    }
  }

  getCurrentUser(): Observable<any> {
    return this.apiService.get<any>('/api/auth/me');
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Administrador';
  }

  isClient(): boolean {
    return this.getUserRole() === 'Cliente';
  }
} 