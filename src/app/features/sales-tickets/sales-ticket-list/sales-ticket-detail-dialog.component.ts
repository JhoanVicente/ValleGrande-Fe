import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { SalesTicket } from '../../../core/models/sales-ticket.model';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-sales-ticket-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule],
  template: `
    <div class="detail-dialog-container">
      <h2 class="dialog-title">Detalles de Venta #{{ data.ticket.ticketId }}</h2>
      <div class="info-row">
        <div class="info-general">
          <h3>Información General</h3>
          <div><b>Fecha:</b> {{ data.ticket.saleDate | date:'shortDate' }}</div>
          <div><b>Cliente:</b> {{ data.ticket.user?.names }} {{ data.ticket.user?.surnames }}</div>
          <div><b>Método de Pago:</b> {{ data.ticket.paymentType?.name }}</div>
        </div>
        <div class="info-total">
          <h3>Total de Venta</h3>
          <div class="total-amount">{{ data.ticket.totalPayment | currency:'PEN':'symbol' }}</div>
        </div>
      </div>
      <div class="products-section">
        <h3>Productos</h3>
        <table mat-table [dataSource]="enrichedProductDetails" class="mat-elevation-z8 product-table">
          <ng-container matColumnDef="product">
            <th mat-header-cell *matHeaderCellDef>Producto</th>
            <td mat-cell *matCellDef="let element">{{element.productName}}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Cantidad</th>
            <td mat-cell *matCellDef="let element">{{element.amount}}</td>
          </ng-container>
          <ng-container matColumnDef="unitPrice">
            <th mat-header-cell *matHeaderCellDef>Precio Unitario</th>
            <td mat-cell *matCellDef="let element">{{element.unitPrice | currency:'PEN':'symbol'}}</td>
          </ng-container>
          <ng-container matColumnDef="subtotal">
            <th mat-header-cell *matHeaderCellDef>Subtotal</th>
            <td mat-cell *matCellDef="let element">{{element.subtotal | currency:'PEN':'symbol'}}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <div *ngIf="!enrichedProductDetails || enrichedProductDetails.length === 0" class="empty-products">
          No hay productos en esta venta.
        </div>
      </div>
      <div class="actions-row">
        <button mat-button color="primary" (click)="dialogRef.close()">Cerrar</button>
      </div>
    </div>
  `,
  styles: [`
    .detail-dialog-container {
      min-width: 420px;
      max-width: 600px;
      padding: 24px 16px 8px 16px;
      background: #fff;
      border-radius: 10px;
    }
    .dialog-title {
      margin-bottom: 18px;
      font-size: 1.4rem;
      font-weight: 600;
      color: #222;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      gap: 32px;
      margin-bottom: 18px;
    }
    .info-general {
      flex: 2;
      font-size: 1rem;
      color: #444;
    }
    .info-total {
      flex: 1;
      background: #f5f8ff;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 18px 0;
      box-shadow: 0 2px 8px rgba(30, 64, 175, 0.06);
    }
    .info-total h3 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .total-amount {
      font-size: 2rem;
      font-weight: bold;
      color: #1976d2;
    }
    .products-section {
      margin-top: 18px;
    }
    .product-table {
      width: 100%;
      margin-bottom: 8px;
    }
    .empty-products {
      color: #888;
      font-style: italic;
      margin-top: 8px;
    }
    .actions-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
  `]
})
export class SalesTicketDetailDialogComponent implements OnInit {
  displayedColumns: string[] = ['product', 'amount', 'unitPrice', 'subtotal'];
  enrichedProductDetails: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SalesTicketDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticket: SalesTicket },
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const details = this.data.ticket.productDetails || [];
    // Si ya tienen nombre y precio, usar directo
    if (details.length > 0 && details[0].product && details[0].product.name) {
      this.enrichedProductDetails = details.map(d => ({
        productName: d.product.name,
        amount: d.amount,
        unitPrice: d.unitPrice || d.product.price,
        subtotal: d.subtotal || (d.amount * (d.unitPrice || d.product.price))
      }));
      return;
    }
    // Si no, buscar los productos por id
    const ids = details.map(d => d.product?.id).filter(Boolean);
    if (ids.length === 0) {
      this.enrichedProductDetails = [];
      return;
    }
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.enrichedProductDetails = details.map(d => {
        const prod = products.find(p => p.id === d.product?.id);
        return {
          productName: prod?.name || 'Sin nombre',
          amount: d.amount,
          unitPrice: d.unitPrice || prod?.price || 0,
          subtotal: d.subtotal || (d.amount * (d.unitPrice || prod?.price || 0))
        };
      });
    });
  }
}
