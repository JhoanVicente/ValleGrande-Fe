import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatIconModule, CommonModule],
  template: `
    <nav *ngIf="authService.isLoggedIn$ | async" class="bg-dark text-white p-4 vh-100 position-fixed top-0 left-0 d-flex flex-column align-items-center" style="width: 250px;">
      <mat-icon class="header-icon">restaurant_menu</mat-icon>
      <h1 class="my-4">RestLosPinos</h1>
      
      <div *ngIf="authService.currentUser$ | async as user" class="user-role mb-3">
        <div>{{ user.names }} {{ user.surnames }}</div>
      </div>
      <div *ngIf="authService.userRole$ | async as role" class="role-badge mb-3">
        Rol: {{ role | titlecase }}
      </div>

      <ul class="list-unstyled d-flex flex-column gap-3">
        <li><a routerLink="/products" class="text-white text-decoration-none">Productos</a></li>
        <li><a routerLink="/categories" class="text-white text-decoration-none">Categorías</a></li>
        
        <li *ngIf="(authService.userRole$ | async) === 'Administrador'">
            <a routerLink="/users" class="text-white text-decoration-none">Usuarios</a>
        </li>
        
        <li *ngIf="(authService.userRole$ | async) === 'Administrador'">
          <a routerLink="/sales-tickets" class="text-white text-decoration-none">Tickets de Venta</a>
        </li>

        <li *ngIf="(authService.userRole$ | async) !== 'Administrador'">
          <a routerLink="/sales-tickets" class="text-white text-decoration-none">Mis Compras</a>
        </li>

        <li *ngIf="(authService.userRole$ | async) !== 'Administrador'">
          <a routerLink="/sales-tickets/new" class="text-white text-decoration-none">Realizar Compra</a>
        </li>

        <li *ngIf="authService.isAdmin()" class="nav-item">
          <a routerLink="/admin/reservations" class="text-white text-decoration-none">Reservaciones</a>
        </li>
        <li *ngIf="authService.isClient()" class="nav-item">
          <a routerLink="/my-reservations" class="text-white text-decoration-none">Mis Reservaciones</a>
        </li>
      </ul>
      <button (click)="logout()" class="logout-btn mt-auto">Cerrar sesión</button>
    </nav>
  `,
  styles: [`
    nav {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Consistent with product list components */
      z-index: 1000; /* Ensure it stays on top */
      border-radius: 0 8px 8px 0; /* Apply border-radius to the right side */
      background-color: black !important; /* Asegura el color negro */
    }
    .header-icon {
      font-size: 64px; /* Tamaño grande para el icono */
      width: 64px;
      height: 64px;
      color: white; /* Color del icono */
      margin-bottom: 16px; /* Espacio debajo del icono */
    }
    h1 {
      font-size: 28px; /* Slightly larger for prominence, but closer to product header */
      font-weight: 500; /* Consistent font-weight */
    }
    .user-role {
      font-size: 16px;
      text-align: center;
    }
    .role-badge {
      font-size: 13px;
      color: #90caf9;
    }
    ul {
      padding: 0; /* Remove default ul padding */
    }
    ul li a {
      padding: 12px 16px; /* Slightly more padding for links */
      border-radius: 4px;
      transition: background-color 0.3s ease, transform 0.2s ease, border-left 0.3s ease;
      font-size: 16px; /* Consistent font size for links */

      &:hover {
        background-color: rgba(255, 255, 255, 0.2); /* Slightly more opaque */
        transform: translateX(5px);
        border-left: 4px solid white; /* Add a subtle left border on hover */
      }
    }
    .logout-btn {
      margin-top: auto;
      width: 100%;
      padding: 12px 0;
      background: #b00020;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    .logout-btn:hover {
      background: #d32f2f;
    }
  `]
})
export class HeaderComponent {
  public authService = inject(AuthService);
  
  constructor(private router: Router) {}

  logout() {
    this.authService.logout();
  }
}