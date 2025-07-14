import { Routes } from '@angular/router';
import { AuthGuard } from './core/services/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminGuard } from './core/services/admin.guard';
import { ClientGuard } from './core/services/client.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  { 
    path: 'products',
    loadChildren: () => import('./features/products/product.routes')
      .then(m => m.PRODUCT_ROUTES),
    canActivate: [AuthGuard]
  },
  { 
    path: 'categories',
    loadComponent: () => import('./features/categories/category-list/category-list.component')
      .then(m => m.CategoryListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'users',
    loadComponent: () => import('./features/users/user-list/user-list.component')
      .then(m => m.UserListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'sales-tickets',
    loadChildren: () => import('./features/sales-tickets/sales-ticket.routes')
      .then(m => m.SALES_TICKET_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/reservations',
    loadComponent: () => import('./features/reservations/reservation-list/reservation-list.component').then(m => m.ReservationListComponent),
    canActivate: [AdminGuard]
  },
  {
    path: 'my-reservations',
    loadComponent: () => import('./features/reservations/my-reservations/my-reservations.component').then(m => m.MyReservationsComponent),
    canActivate: [ClientGuard]
  },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
];