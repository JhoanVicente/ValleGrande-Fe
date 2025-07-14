import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesTicketService } from '../../../core/services/sales-ticket.service';
import { SalesTicket } from '../../../core/models/sales-ticket.model';
import { SalesTicketDialogComponent } from './sales-ticket-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { OrderStatusTypeService } from '../../../core/services/order-status-type.service';
import { OrderStatusType } from '../../../core/models/order-status-type.model';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { saveAs } from 'file-saver';
import { SalesTicketDetailDialogComponent } from './sales-ticket-detail-dialog.component';

@Component({
  selector: 'app-sales-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginator,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  template: `
    <div class="sales-ticket-list-container">
      <div class="header">
        <div class="header-content">
          <h2>{{ userRole === 'Administrador' ? 'Tickets de Venta' : 'Mis Compras' }}</h2>
          <div class="header-actions">
            <button *ngIf="userRole === 'Administrador'" mat-raised-button color="primary" (click)="openDialog()" class="action-button">
              <mat-icon>add</mat-icon>
              <span>Nuevo Ticket</span>
            </button>
            <button *ngIf="userRole !== 'Administrador'" mat-raised-button color="primary" [routerLink]="['/sales-tickets/purchase-launcher']" class="action-button">
              <mat-icon>shopping_cart</mat-icon>
              <span>Realizar Compra</span>
            </button>
            <button *ngIf="userRole === 'Administrador'" mat-raised-button 
                    [color]="currentFilter === 'inactive' ? 'warn' : ''" 
                    (click)="toggleInactiveTickets()" 
                    class="action-button">
              <mat-icon>archive</mat-icon>
              <span>{{ currentFilter === 'inactive' ? 'Ver Activos' : 'Ver Inactivos' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="userRole === 'Administrador'" class="filters-container">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Buscar por nombre del cliente</mat-label>
          <input matInput [(ngModel)]="clientNameFilter" (keyup)="applyFilters()" placeholder="Ingrese nombre del cliente">
          <mat-icon matSuffix class="search-icon">search</mat-icon>
        </mat-form-field>
      </div>

      <div class="content">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
        </div>

        <div *ngIf="salesTickets.length === 0 && !loading && !error" class="empty-state-message">
          <p>No se encontraron tickets de venta.</p>
        </div>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
            <!-- ID Column -->
            <ng-container matColumnDef="ticketId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let element">{{element.ticketId}}</td>
            </ng-container>

            <!-- Fecha Column -->
            <ng-container matColumnDef="saleDate">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let element">{{element.saleDate | date:'short'}}</td>
            </ng-container>

            <!-- Client Name Column -->
            <ng-container matColumnDef="clientName">
              <th mat-header-cell *matHeaderCellDef>Cliente</th>
              <td mat-cell *matCellDef="let element">{{element.user?.names}} {{element.user?.surnames}}</td>
            </ng-container>

            <!-- Total Column -->
            <ng-container matColumnDef="totalPayment">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let element">{{element.totalPayment | currency:'PEN':'symbol'}}</td>
            </ng-container>

            <!-- Delivery Column -->
            <ng-container matColumnDef="delivery">
              <th mat-header-cell *matHeaderCellDef>Delivery</th>
              <td mat-cell *matCellDef="let element">{{element.delivery}}</td>
            </ng-container>

            <!-- Estado Column -->
            <ng-container matColumnDef="orderStatusType">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let element" class="status-cell">
                <span class="status-badge"
                      [ngClass]="{'active': element.orderStatusType?.name === 'Activo'}">
                  {{ element.orderStatusType?.name }}
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let element">
                <div class="action-buttons" *ngIf="currentFilter !== 'inactive'">
                  <button mat-icon-button 
                          color="accent" 
                          (click)="openDialog(element, true)" 
                          matTooltip="Ver Detalle"
                          class="action-button view">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button *ngIf="userRole === 'Administrador'" mat-icon-button 
                          color="primary" 
                          (click)="openDialog(element)" 
                          matTooltip="Editar"
                          class="action-button edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button *ngIf="userRole === 'Administrador'" mat-icon-button 
                          color="warn" 
                          (click)="deleteSalesTicket(element)" 
                          matTooltip="Eliminar"
                          class="action-button delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="primary" 
                          (click)="printTicket(element)"
                          matTooltip="Imprimir Ticket"
                          class="action-button print">
                    <mat-icon>print</mat-icon>
                  </button>
                </div>
                <div class="action-buttons" *ngIf="currentFilter === 'inactive' && userRole === 'Administrador'">
                  <button mat-icon-button 
                          color="primary" 
                          (click)="restoreSalesTicket(element)" 
                          matTooltip="Restaurar"
                          class="action-button restore">
                    <mat-icon>restore</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="displayedColumns.length">No se encontraron tickets de venta que coincidan con los filtros</td>
            </tr>
          </table>
        </div>
        <mat-paginator 
          [length]="totalTicketsCount"
          [pageSizeOptions]="pageSizeOptions"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          (page)="onPageChange($event)"
          aria-label="Seleccionar página de tickets"
          labelItemsPerPage="Tickets por página:">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .sales-ticket-list-container {
      padding: 40px 24px 24px 24px;
      background-color: #f5f5f5;
      min-height: 100vh;
      max-width: 1200px;
      margin: 0 auto;

      .header {
        background-color: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;

          h2 {
            margin: 0;
            color: #333;
            font-size: 24px;
            font-weight: 500;
          }

          .header-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;

            .action-button {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 0 16px;
              height: 40px;
              border-radius: 4px;
              font-weight: 500;
              transition: all 0.3s ease;

              mat-icon {
                margin-right: 4px;
              }

              &:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
            }
          }
        }
      }

      .filters-container {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;

        .filter-field {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        ::ng-deep {
          .mat-mdc-form-field-subscript-wrapper {
            display: none;
          }

          .mat-mdc-form-field-flex {
            background-color: #f8f9fa;
            border-radius: 4px;
            padding: 0 12px;
          }

          .mat-mdc-text-field-wrapper {
            background-color: transparent;
          }

          .mat-mdc-form-field-infix {
            padding: 12px 0;
          }

          .search-icon {
            color: #666;
          }
        }
      }

      .content {
        background-color: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .loading-container {
          display: flex;
          justify-content: center;
          padding: 32px;
        }

        .empty-state-message {
          text-align: center;
          padding: 32px;
          color: #757575;
          font-style: italic;
        }

        .error-message {
          color: #f44336;
          padding: 16px;
          background-color: #ffebee;
          border-radius: 4px;
          margin-bottom: 16px;
        }

        .table-container {
          overflow-x: auto;

          table {
            width: 100%;

            .mat-mdc-header-row {
              background-color: #1976d2; /* Color de encabezado primario */
              
              .mat-mdc-header-cell {
                color: white;
                font-weight: 500;
                font-size: 14px;
                padding: 16px;
              }
            }

            .mat-mdc-row {
              &:hover {
                background-color: #f5f5f5;
              }
              &:nth-child(even) { /* Estilo para filas pares (cebreado) */
                background-color: #f9f9f9;
              }
            }

            .mat-column-actions {
              width: 120px;
              text-align: center;

              .action-buttons {
                display: flex;
                justify-content: center;
                gap: 8px;

                .action-button {
                  &.view {
                    color: #673ab7; /* Morado para ver */
                  }
                  &.edit {
                    color: #2196f3; /* Azul para editar */
                  }
                  &.delete {
                    color: #f44336; /* Rojo para eliminar */
                  }
                  &.restore { /* Estilo para el botón de restaurar */
                    color: #4CAF50; /* Verde para restaurar */
                  }
                }
              }
            }
          }
        }
      }
    }

    .status-active {
      background-color: #E8F5E9; /* Un verde muy claro */
      color: #388E3C;           /* Un verde más oscuro */
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: 500;
      display: inline-block;
    }

    .status-inactive {
      color: white;
      background-color: #E57373;
      padding: 3px 10px; /* Reducido para hacerlo más pequeño */
      border-radius: 16px;
      font-weight: 500;
      display: inline-block;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      display: inline-block;

      &.active {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &:not(.active) {
        background-color: #ffebee;
        color: #c62828;
      }
    }

    .status-cell {
      text-align: center;
    }

    // Responsive adjustments
    @media (max-width: 768px) {
      .sales-ticket-list-container {
        padding: 16px;

        .header {
          padding: 16px;

          .header-content {
            flex-direction: column;
            align-items: stretch;

            .header-actions {
              flex-direction: column;
            }
          }
        }

        .content {
          padding: 16px;
        }
      }
    }
  `]
})
export class SalesTicketListComponent implements OnInit {
  salesTickets: SalesTicket[] = [];
  currentFilter: 'active' | 'inactive' | 'all' = 'active';
  totalTicketsCount = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  displayedColumns: string[] = ['ticketId', 'saleDate', 'clientName', 'totalPayment', 'delivery', 'orderStatusType', 'actions'];
  dataSource = new MatTableDataSource<SalesTicket>([]);
  loading = false;
  error: string = '';
  clientNameFilter: string = '';
  userRole: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private salesTicketService: SalesTicketService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private orderStatusTypeService: OrderStatusTypeService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit(): void {
    this.loadSalesTickets();
    this.setupFilter();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadSalesTickets(): void {
    this.loading = true;
    this.error = '';

    if (this.userRole === 'Administrador') {
      const ticketsObservable = this.currentFilter === 'inactive'
        ? this.salesTicketService.getInactiveSalesTickets()
        : this.salesTicketService.getAllSalesTickets();
      
      ticketsObservable.subscribe({
        next: (data) => {
          this.salesTickets = data;
          this.dataSource.data = data;
          this.totalTicketsCount = data.length;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los tickets de venta.';
          this.loading = false;
        }
      });
    } else {
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          if (user && user.userId) {
            this.salesTicketService.getSalesTicketsByUserId(user.userId).subscribe({
              next: (tickets) => {
                this.salesTickets = tickets;
                this.dataSource.data = tickets;
                this.totalTicketsCount = tickets.length;
                this.loading = false;
              },
              error: (err) => {
                this.error = 'Error al cargar tus compras.';
                this.loading = false;
              }
            });
          } else {
            this.error = 'No se pudo obtener el identificador del usuario desde el servidor.';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al obtener la información del usuario.';
          this.loading = false;
        }
      });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  openDialog(salesTicket?: SalesTicket, isViewMode: boolean = false): void {
    if (isViewMode && salesTicket) {
      this.dialog.open(SalesTicketDetailDialogComponent, {
        width: '600px',
        data: { ticket: salesTicket }
      });
      return;
    }
    const dialogRef = this.dialog.open(SalesTicketDialogComponent, {
      width: '800px',
      disableClose: true,
      data: { 
        title: isViewMode ? 'Ver Detalle del Ticket' : (salesTicket ? 'Editar Ticket de Venta' : 'Nuevo Ticket de Venta'),
        salesTicket: salesTicket,
        isEdit: !!salesTicket && !isViewMode,
        isView: isViewMode
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadSalesTickets();
      }
    });
  }

  toggleInactiveTickets(): void {
    console.count('toggleInactiveTickets called');
    this.currentFilter = this.currentFilter === 'inactive' ? 'active' : 'inactive';
    this.loadSalesTickets();
  }

  restoreSalesTicket(salesTicket: SalesTicket): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar restauración',
        message: '¿Está seguro de que desea restaurar este ticket de venta a estado activo?',
        confirmText: 'Restaurar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && salesTicket.ticketId) {
        this.salesTicketService.restoreSalesTicket(salesTicket.ticketId!).subscribe({
          next: () => {
            this.loadSalesTickets();
            this.snackBar.open('Ticket restaurado correctamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error al restaurar el ticket:', error);
            this.error = `Error al restaurar el ticket: ${error.message || 'Error desconocido'}`;
          }
        });
      }
    });
  }

  deleteSalesTicket(salesTicket: SalesTicket): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: '¿Está seguro de que desea eliminar lógicamente este ticket de venta? Se marcará como CANCELADO.',
        confirmText: 'Eliminar Lógicamente',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && salesTicket.ticketId) {
        this.salesTicketService.deleteSalesTicket(salesTicket.ticketId).subscribe({
          next: () => {
            this.loadSalesTickets();
            this.snackBar.open('Ticket eliminado lógicamente (Cancelado) correctamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error al eliminar lógicamente el ticket:', error);
            this.error = `Error al eliminar lógicamente el ticket: ${error.message || 'Error desconocido'}`;
          }
        });
      }
    });
  }

  printTicket(ticket: SalesTicket): void {
    if (!ticket.ticketId) {
      this.snackBar.open('No se puede imprimir un ticket sin ID.', 'Cerrar', { duration: 3000 });
      return;
    }
    this.salesTicketService.downloadSalesTicketPdf(ticket.ticketId).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      },
      error: (err) => {
        this.snackBar.open('No se pudo abrir el PDF del ticket.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private setupFilter(): void {
    this.dataSource.filterPredicate = (data: SalesTicket): boolean => {
      if (!this.clientNameFilter) {
        return true;
      }

      const searchTerm = this.clientNameFilter.toLowerCase();
      const fullName = `${data.user?.names || ''} ${data.user?.surnames || ''}`.toLowerCase();

      return fullName.includes(searchTerm);
    };
  }

  applyFilters(): void {
    this.dataSource.filter = this.clientNameFilter;
  }
} 
