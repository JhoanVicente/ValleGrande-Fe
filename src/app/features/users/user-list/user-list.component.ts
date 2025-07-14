import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { RestaurantUser } from '../../../core/models/restaurant-user.model';
import { UserType } from '../../../core/models/user-type.model';
import { UserService } from '../../../core/services/user.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatPaginatorModule
    // Quitar UserDialogComponent de aquí
  ],
  template: `
    <div class="user-list-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Usuarios</h2>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Nuevo Usuario
        </button>
      </div>

      <div class="mb-3">
        <div class="btn-group" role="group">
          <button 
            mat-button 
            [color]="statusFilter === 'all' ? 'primary' : ''" 
            (click)="filterByStatus('all')"
          >
            Todos
          </button>
          <button 
            mat-button 
            [color]="statusFilter === 'A' ? 'primary' : ''" 
            (click)="filterByStatus('A')"
          >
            Activos
          </button>
          <button 
            mat-button 
            [color]="statusFilter === 'I' ? 'primary' : ''" 
            (click)="filterByStatus('I')"
          >
            Inactivos
          </button>
        </div>
        
        <mat-form-field appearance="outline" class="w-100 mt-3">
          <mat-label>Buscar usuario</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Buscar por nombre, apellido o email...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de Usuario</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers">
              <td>{{ user.userId }}</td>
              <td>{{ user.userName }}</td>
              <td>{{ user.names }}</td>
              <td>{{ user.surnames }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.telephone }}</td>
              <td>
                <span [class]="user.state === 'A' ? 'badge bg-success' : 'badge bg-danger'">
                  {{ user.state === 'A' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ user.userType.name }}</td>
              <td>
                <div class="btn-group">
                  <button mat-icon-button color="primary" (click)="openEditDialog(user)" matTooltip="Editar Usuario">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteUser(user)" *ngIf="user.state === 'A'" matTooltip="Desactivar Usuario">
                    <mat-icon>delete</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="restoreUser(user)" *ngIf="user.state === 'I'" matTooltip="Restaurar Usuario">
                    <mat-icon>restore</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <mat-paginator 
        [length]="totalUsersCount" 
        [pageSize]="pageSize" 
        [pageSizeOptions]="pageSizeOptions" 
        (page)="onPageChange($event)"
        aria-label="Select page of users">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .user-list-container {
      padding: 40px 24px 24px 24px; /* Ajustando el padding superior */
      background-color: #f5f5f5;
      min-height: 100vh;
      max-width: 1200px; /* Limita el ancho del contenedor */
      margin: 0 auto; /* Centra el contenedor horizontalmente */
      border-radius: 8px; /* Borde redondeado */
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra consistente */
    }
    .w-100 { width: 100%; }
    .mt-3 { margin-top: 1rem; }
    h2 {
      color: #333;
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }
    table {
      width: 100%;
      margin-top: 20px;
      border-collapse: collapse;

      th {
        background-color: #1976d2; /* Color de cabecera azul */
        color: white;
        font-weight: 500;
        padding: 16px;
        text-align: left;
      }
      td {
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;
      }
      tr:hover {
        background-color: #f5f5f5;
      }
    }
    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .bg-success {
      background-color: #e8f5e9;
      color: white !important; /* Asegurado en blanco para mejor visibilidad */
    }
    .bg-danger {
      background-color: #ffebee;
      color: white !important; /* Asegurado en blanco para mejor visibilidad */
    }
    .btn-group {
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .mat-mdc-form-field {
      background-color: white;
      border-radius: 4px;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: RestaurantUser[] = [];
  filteredUsers: RestaurantUser[] = [];
  statusFilter: string | 'all' = 'all';
  searchTerm: string = '';
  userTypes: UserType[] = [];

  // Propiedades para la paginación
  totalUsersCount = 0;
  pageSize = 10; // Número de elementos por página por defecto
  pageIndex = 0; // Índice de la página actual (basado en 0)
  pageSizeOptions: number[] = [5, 10, 25, 50, 100]; // Opciones de tamaño de página

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadUserTypes();
  }

  loadUserTypes(): void {
    this.userService.getUserTypes().subscribe({
      next: (data) => {
        this.userTypes = data;
        console.log('Tipos de usuario cargados:', this.userTypes);
      },
      error: (error) => {
        console.error('Error al cargar tipos de usuario', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data; // Inicializar filteredUsers con todos los usuarios
        this.applyFilters(); // Opcional: aplicar filtros iniciales
      },
      error: (error) => {
        console.error('Error al cargar usuarios', error);
      }
    });
  }

  filterByStatus(status: string | 'all'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.users;
    
    if (this.statusFilter !== 'all') {
      result = result.filter(user => user.state === this.statusFilter);
    }
    
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(user => 
        user.userName.toLowerCase().includes(term) ||
        user.names.toLowerCase().includes(term) ||
        user.surnames.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Aplicar paginación después de filtrar
    this.totalUsersCount = result.length; // Actualizar el conteo total después del filtrado
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredUsers = result.slice(startIndex, endIndex);
  }

  // Método para manejar el cambio de página
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters(); // Re-aplicar filtros para actualizar la paginación
  }

  openAddDialog(): void {
    console.log('Abriendo diálogo de nuevo usuario. Tipos de usuario disponibles:', this.userTypes);
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '800px',
      data: {
        title: 'Nuevo Usuario',
        user: {
          userName: '',
          password: '',
          names: '',
          surnames: '',
          dateOfBirth: '',
          address: '',
          telephone: '',
          email: '',
          documentType: '',
          numberType: '',
          state: 'A',
          userType: null
        },
        userTypes: this.userTypes,
        isEdit: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: (newUser) => {
            this.users.push(newUser);
            this.applyFilters();
            console.log('Usuario creado con éxito');
          },
          error: (error) => {
            console.error('Error al crear usuario', error);
          }
        });
      }
    });
  }

  openEditDialog(user: RestaurantUser): void {
    const userToEdit = { ...user };
    
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '800px',
      data: {
        title: 'Editar Usuario',
        user: userToEdit,
        userTypes: this.userTypes,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.userId) {
        this.userService.updateUser(user.userId, result).subscribe({
          next: (updatedUser) => {
            const index = this.users.findIndex(u => u.userId === user.userId);
            if (index !== -1) {
              this.users[index] = updatedUser;
              this.applyFilters();
            }
            console.log('Usuario actualizado con éxito');
          },
          error: (error) => {
            console.error('Error al actualizar usuario', error);
          }
        });
      }
    });
  }

  deleteUser(user: RestaurantUser): void {
    if (!user.userId) {
      console.error('Error: ID de usuario no válido');
      return;
    }
    if (confirm(`¿Está seguro de que desea desactivar al usuario ${user.names} ${user.surnames}?`)) {
      this.userService.deleteUser(user.userId).subscribe({
        next: () => {
          console.log('Usuario desactivado con éxito');
          const index = this.users.findIndex(u => u.userId === user.userId);
          if (index > -1) {
            this.users[index].state = 'I';
          }
          this.applyFilters(); 
        },
        error: (error: any) => {
          console.error('Error al desactivar el usuario', error);
        }
      });
    }
  }

  restoreUser(user: RestaurantUser): void {
    if (!user.userId) {
      console.error('Error: ID de usuario no válido');
      return;
    }
    if (confirm(`¿Está seguro de que desea restaurar al usuario ${user.names} ${user.surnames}?`)) {
      this.userService.activateUser(user.userId).subscribe({
        next: () => {
          console.log('Usuario restaurado con éxito');
           const index = this.users.findIndex(u => u.userId === user.userId);
           if (index > -1) {
             this.users[index].state = 'A';
           }
           this.applyFilters();
        },
        error: (error: any) => {
          console.error('Error al restaurar el usuario', error);
        }
      });
    }
  }
}
