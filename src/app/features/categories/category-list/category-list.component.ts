import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

// Componente ConfirmDialog definido aquí para evitar error de importación
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelText }}</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">{{ data.confirmText }}</button>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; confirmText: string; cancelText: string }
  ) {}
}

@Component({
  selector: 'app-category-list',
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
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="category-list-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Categorías</h2>
        <button *ngIf="userRole === 'Administrador'" mat-raised-button color="primary" (click)="openAddDialog()" [disabled]="loading">
          <mat-icon>add</mat-icon> Nueva Categoría
        </button>
      </div>
      
      <div class="mb-3">
        <div class="btn-group" role="group" *ngIf="userRole === 'Administrador'">
          <button 
            mat-button 
            [color]="statusFilter === 'all' ? 'primary' : ''" 
            (click)="filterByStatus('all')"
            [disabled]="loading"
          >
            Todos
          </button>
          <button 
            mat-button 
            [color]="statusFilter === 'active' ? 'primary' : ''" 
            (click)="filterByStatus('active')"
            [disabled]="loading"
          >
            Activos
          </button>
          <button 
            mat-button 
            [color]="statusFilter === 'inactive' ? 'primary' : ''" 
            (click)="filterByStatus('inactive')"
            [disabled]="loading"
          >
            Inactivos
          </button>
        </div>
        
        <mat-form-field appearance="outline" class="w-100 mt-3">
          <mat-label>Buscar categoría</mat-label>
          <input 
            matInput 
            [(ngModel)]="searchTerm" 
            (input)="applyFilters()" 
            placeholder="Buscar por nombre..."
            [disabled]="loading"
          >
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
      
      <div *ngIf="loading" class="text-center my-3">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <div class="mat-elevation-z8 table-responsive" *ngIf="!loading">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th class="col-description">Descripción</th>
              <th>Estado</th>
              <th *ngIf="userRole === 'Administrador'">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of filteredCategories">
              <td>{{ category.id }}</td>
              <td>{{ category.name }}</td>
              <td class="col-description">{{ category.description }}</td>
              <td>
                <span [class]="category.status === 'A' ? 'badge bg-success' : 'badge bg-danger'">
                  {{ category.status === 'A' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td *ngIf="userRole === 'Administrador'">
                <button 
                  mat-icon-button 
                  color="primary" 
                  (click)="openEditDialog(category)" 
                  [disabled]="loading"
                  matTooltip="Editar Categoría"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  mat-icon-button 
                  color="warn" 
                  (click)="deleteCategory(category)" 
                  [disabled]="loading || category.status !== 'A'"
                  [matTooltip]="category.status !== 'A' ? 'La categoría no está activa' : 'Inactivar Categoría'"
                >
                  <mat-icon>delete</mat-icon>
                </button>
                
                <button 
                  mat-icon-button 
                  color="accent" 
                  (click)="confirmRestoreCategory(category)" 
                  [disabled]="loading || category.status !== 'I'"
                  [matTooltip]="category.status !== 'I' ? 'La categoría no está inactiva' : 'Restaurar Categoría'"
                  *ngIf="category.status === 'I'"
                >
                  <mat-icon>restore</mat-icon>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredCategories.length === 0 && !loading">
              <td colspan="5" class="text-center">No se encontraron categorías</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .category-list-container {
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
    .col-description {
      max-width: 250px; /* Ancho reducido para la descripción */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap; /* Asegura que el texto se mantenga en una sola línea */
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  userRole: string | null = null;

  constructor() {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.error = `Error al cargar las categorías.`;
        this.loading = false;
      }
    });
  }

  filterByStatus(status: 'all' | 'active' | 'inactive'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = this.categories;

    if (this.statusFilter !== 'all' && this.userRole === 'Administrador') {
      const filterStatus = this.statusFilter === 'active' ? 'A' : 'I';
      result = result.filter(category => category.status === filterStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(category =>
        category.name.toLowerCase().includes(term)
      );
    }

    this.filteredCategories = result;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px',
      data: { title: 'Nueva Categoría', category: { name: '', status: 'A' } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.createCategory(result).subscribe(() => this.loadCategories());
      }
    });
  }

  openEditDialog(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '400px',
      data: { title: 'Editar Categoría', category: { ...category } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && category.id) {
        this.categoryService.updateCategory(category.id, result).subscribe(() => this.loadCategories());
      }
    });
  }

  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar inactivación',
        message: `¿Está seguro de que desea inactivar la categoría "${category.name}"?`,
        confirmText: 'Inactivar', cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && category.id) {
        const updatedCategory: Category = { ...category, status: 'I' };
        this.categoryService.updateCategory(category.id, updatedCategory).subscribe(() => this.loadCategories());
      }
    });
  }
  
  confirmRestoreCategory(category: Category): void {
     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar restauración',
        message: `¿Está seguro de que desea restaurar la categoría "${category.name}"?`,
        confirmText: 'Restaurar', cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && category.id) {
        this.restoreCategory(category.id);
      }
    });
  }

  restoreCategory(id: number): void {
    this.categoryService.restoreCategory(id).subscribe(() => this.loadCategories());
  }
}
