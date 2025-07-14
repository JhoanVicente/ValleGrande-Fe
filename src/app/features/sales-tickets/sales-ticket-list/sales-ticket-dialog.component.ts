import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesTicket } from '../../../core/models/sales-ticket.model';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { OrderStatusType } from '../../../core/models/order-status-type.model';
import { PaymentType } from '../../../core/models/payment-type.model';
import { OrderStatusTypeService } from '../../../core/services/order-status-type.service';
import { PaymentTypeService } from '../../../core/services/payment-type.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { RestaurantUser } from '../../../core/models/restaurant-user.model';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { SalesTicketService } from '../../../core/services/sales-ticket.service';

interface DialogData {
  title: string;
  salesTicket: SalesTicket;
  isEdit: boolean;
  isView?: boolean;
}

@Component({
  selector: 'app-sales-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <form [formGroup]="salesTicketForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <!-- Información básica -->
        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Fecha de Venta</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="saleDate" [max]="maxDate">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="salesTicketForm.get('saleDate')?.hasError('required')">
                La fecha es requerida
              </mat-error>
            </mat-form-field>
          </div>

          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Delivery</mat-label>
              <mat-select formControlName="delivery">
                <mat-option value="SI">Sí</mat-option>
                <mat-option value="NO">No</mat-option>
              </mat-select>
              <mat-error *ngIf="salesTicketForm.get('delivery')?.hasError('required')">
                El delivery es requerido
              </mat-error>
            </mat-form-field>
          </div>
        </div>

        <!-- Dirección de delivery -->
        <div class="row" *ngIf="salesTicketForm.get('delivery')?.value === 'SI'">
          <div class="col-12">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Dirección de Delivery</mat-label>
              <input matInput formControlName="deliveryAddress">
              <mat-error *ngIf="salesTicketForm.get('deliveryAddress')?.hasError('required')">
                La dirección es requerida para delivery
              </mat-error>
            </mat-form-field>
          </div>
        </div>

        <!-- Tipo de pago -->
        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Tipo de Pago</mat-label>
              <mat-select formControlName="paymentType" [compareWith]="comparePaymentTypes">
                <mat-option *ngFor="let type of paymentTypes" [value]="type">
                  {{type.name}}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="salesTicketForm.get('paymentType')?.hasError('required')">
                El tipo de pago es requerido
              </mat-error>
            </mat-form-field>
          </div>
          <!-- Selector de Cliente/Usuario -->
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Cliente</mat-label>
              <mat-select formControlName="user" [compareWith]="compareUsers">
                <mat-option *ngFor="let user of users" [value]="user">
                  {{user.names}} {{user.surnames}}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="salesTicketForm.get('user')?.hasError('required')">
                El cliente es requerido
              </mat-error>
            </mat-form-field>
          </div>
        </div>

        <!-- Nota -->
        <div class="row">
          <div class="col-12">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Nota</mat-label>
              <textarea matInput formControlName="note" rows="3"></textarea>
            </mat-form-field>
          </div>
        </div>

        <!-- Nuevo campo para OrderStatusType -->
        <div class="row">
          <div class="col-12">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Estado de la Orden</mat-label>
              <mat-select formControlName="orderStatusType" [compareWith]="compareOrderStatusTypes">
                <mat-option *ngFor="let status of orderStatusTypes" [value]="status">
                  {{status.name}}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="salesTicketForm.get('orderStatusType')?.hasError('required')">
                El estado de la orden es requerido
              </mat-error>
            </mat-form-field>
          </div>
        </div>

        <!-- Sección de Productos -->
        <div class="mt-4">
          <h3>Productos</h3>
          
          <!-- Selector de Categoría y Producto (Visible solo en modo edición/creación) -->
          <div class="row mb-3" *ngIf="!data.isView">
            <div class="col-md-6">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Categoría</mat-label>
                <mat-select [(value)]="selectedCategory" (selectionChange)="onCategoryOrProductSelectionChange()">
                  <mat-option [value]="null">Todas</mat-option>
                  <mat-option *ngFor="let category of categories" [value]="category">
                    {{category.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <div class="col-md-6">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Seleccionar Producto</mat-label>
                <mat-select [(value)]="selectedProduct" (selectionChange)="onCategoryOrProductSelectionChange()">
                  <mat-option *ngFor="let product of availableProducts" [value]="product">
                    {{product.name}} - {{product.price | currency:'PEN':'symbol'}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Cantidad y Botón Agregar (Visible solo en modo edición/creación) -->
          <div class="row mb-3" *ngIf="!data.isView">
             <div class="col-md-6">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" [(ngModel)]="selectedQuantity" 
                       min="1" 
                       [disabled]="!selectedProduct"
                       [ngModelOptions]="{standalone: true}"
                       (ngModelChange)="onQuantityChange($event)">
              </mat-form-field>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <button mat-raised-button color="primary" class="w-100" 
                      type="button"
                      (click)="addProduct()" 
                      [disabled]="!selectedProduct || selectedQuantity < 1">
                <mat-icon>add</mat-icon>
                Agregar
              </button>
            </div>
          </div>

          <!-- Tabla de productos (Siempre visible si hay productos) -->
          <div class="table-responsive">
            <table mat-table [dataSource]="productDetails" class="mat-elevation-z8">
              <!-- Producto Column -->
              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Producto</th>
                <td mat-cell *matCellDef="let element">{{element.product?.name}}</td>
              </ng-container>

              <!-- Cantidad Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                <td mat-cell *matCellDef="let element">{{element.amount}}</td>
              </ng-container>

              <!-- Precio Unitario Column -->
              <ng-container matColumnDef="unitPrice">
                <th mat-header-cell *matHeaderCellDef>Precio Unit.</th>
                <td mat-cell *matCellDef="let element">{{element.unitPrice | currency:'PEN':'symbol'}}</td>
              </ng-container>

              <!-- Subtotal Column -->
              <ng-container matColumnDef="subtotal">
                <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                <td mat-cell *matCellDef="let element">{{element.subtotal | currency:'PEN':'symbol'}}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let element; let i = index">
                  <button mat-icon-button color="warn" (click)="removeProduct(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="productColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: productColumns;"></tr>
            </table>
          </div>

          <div class="total-summary">
            <div class="total-label">Total:</div>
            <div class="total-value">{{ calculateTotal() | currency:'PEN':'symbol' }}</div>
          </div>

        </div>
      </div>

      <div mat-dialog-actions align="end" *ngIf="!data.isView">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" 
                [disabled]="salesTicketForm.invalid || productDetails.length === 0">
          Realizar Compra
        </button>
      </div>
    </form>
  `,
  styles: [`
    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }
    .col-md-6 {
      flex: 0 0 50%;
      max-width: 50%;
      padding-right: 15px;
      padding-left: 15px;
    }
    .col-md-4 {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
      padding-right: 15px;
      padding-left: 15px;
    }
    .col-md-2 {
      flex: 0 0 16.666667%;
      max-width: 16.666667%;
      padding-right: 15px;
      padding-left: 15px;
    }
    .col-12 {
      flex: 0 0 100%;
      max-width: 100%;
      padding-right: 15px;
      padding-left: 15px;
    }
    .w-100 {
      width: 100%;
    }
    .mt-4 {
      margin-top: 1.5rem;
    }
    .mb-3 {
      margin-bottom: 1rem;
    }
    .mt-3 {
      margin-top: 1rem;
    }
    .d-flex {
      display: flex;
    }
    .justify-content-end {
      justify-content: flex-end;
    }
    .align-items-end {
      align-items: flex-end;
    }
    .table-responsive {
      margin-top: 1rem;
    }
    table {
      width: 100%;
    }
    .total-summary {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 1.5rem;
      padding: 1rem 1.5rem;
      background-color: #e0f2f7; /* Un azul claro muy sutil */
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      gap: 1rem;
    }
    .total-label {
      font-weight: bold;
      font-size: 1.2rem;
      color: #333;
    }
    .total-value {
      font-weight: bold;
      font-size: 1.5rem;
      color: #007bff; /* Un azul vibrante */
      white-space: nowrap;
    }
  `]
})
export class SalesTicketDialogComponent implements OnInit {
  salesTicketForm: FormGroup;
  products: Product[] = [];
  availableProducts: Product[] = [];
  categories: Category[] = [];
  paymentTypes: PaymentType[] = [];
  productDetails: any[] = [];
  productColumns: string[] = ['product', 'amount', 'unitPrice', 'subtotal', 'actions'];
  selectedCategory: Category | null = null;
  selectedProduct: Product | null = null;
  selectedQuantity: number = 1;
  maxDate: Date = new Date();
  users: RestaurantUser[] = [];
  orderStatusTypes: OrderStatusType[] = [];
  userRole: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<SalesTicketDialogComponent>,
    private fb: FormBuilder,
    private productService: ProductService,
    private orderStatusTypeService: OrderStatusTypeService,
    private paymentTypeService: PaymentTypeService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private authService: AuthService,
    private salesTicketService: SalesTicketService
  ) {
    this.userRole = this.authService.getUserRole();
    const ticket = this.data.salesTicket;
    this.salesTicketForm = this.fb.group({
      ticketId: [ticket?.ticketId],
      saleDate: [ticket?.saleDate ? new Date(ticket.saleDate) : new Date(), Validators.required],
      totalPayment: [ticket?.totalPayment || 0],
      delivery: [ticket?.delivery || 'NO', Validators.required],
      deliveryAddress: [ticket?.deliveryAddress],
      note: [ticket?.note],
      paymentType: [ticket?.paymentType, Validators.required],
      user: [ticket?.user, Validators.required],
      orderStatusType: [ticket?.orderStatusType, Validators.required]
    });
    // Inicializar productDetails si es edición
    if (this.data.isEdit && ticket?.productDetails) {
      this.productDetails = [...ticket.productDetails];
    }
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadPaymentTypes();
    this.loadUsers();
    this.loadOrderStatusTypes();

    if (this.data.isView) {
      this.salesTicketForm.disable();
      this.productColumns = ['product', 'amount', 'unitPrice', 'subtotal'];
    }

    this.salesTicketForm.get('delivery')?.valueChanges.subscribe(value => {
      const deliveryAddressControl = this.salesTicketForm.get('deliveryAddress');
      if (value === 'SI') {
        deliveryAddressControl?.setValidators(Validators.required);
      } else {
        deliveryAddressControl?.clearValidators();
        deliveryAddressControl?.setValue(null);
      }
      deliveryAddressControl?.updateValueAndValidity();
    });

    if (!this.data.isEdit) {
      this.salesTicketForm.get('saleDate')?.setValue(new Date());
      this.salesTicketForm.get('delivery')?.setValue('NO');
    }

    if (this.userRole !== 'Administrador') {
      this.authService.getCurrentUser().subscribe({
        next: (currentUser) => {
          if (currentUser) {
            this.salesTicketForm.get('user')?.setValue(currentUser);
            this.salesTicketForm.get('user')?.disable();
          }
        },
        error: () => this.snackBar.open('Error al cargar datos del usuario', 'Cerrar', { duration: 3000 })
      });
    }
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(data => {
      this.products = data;
      this.filterAvailableProducts();
      // Si es edición, enriquecer los detalles con el producto completo o placeholder
      if (this.data.isEdit && this.productDetails.length > 0) {
        this.productDetails = this.productDetails.map(detail => {
          const fullProduct = this.products.find(p => p.id === (detail.product?.id || detail.productId));
          return {
            ...detail,
            product: fullProduct || { id: detail.productId || (detail.product && detail.product.id), name: 'Producto no encontrado', price: 0 },
            unitPrice: fullProduct ? fullProduct.price : 0,
            subtotal: (fullProduct ? fullProduct.price : 0) * detail.amount
          };
        });
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  loadPaymentTypes(): void {
    this.paymentTypeService.getPaymentTypes().subscribe(data => {
      this.paymentTypes = data;
    });
  }

  loadUsers(): void {
    if (this.userRole === 'Administrador') {
      this.userService.getAllUsers().subscribe(data => {
        this.users = data;
      });
    }
  }

  loadOrderStatusTypes(): void {
    this.orderStatusTypeService.getAll().subscribe({
      next: (data: OrderStatusType[]) => {
        this.orderStatusTypes = data;
        if (!this.data.isEdit && !this.salesTicketForm.get('orderStatusType')?.value) {
          const defaultStatus = this.orderStatusTypes.find(status => status.name === 'Activo') 
                             || this.orderStatusTypes.find(status => status.name === 'Pendiente');
          if (defaultStatus) {
            this.salesTicketForm.get('orderStatusType')?.setValue(defaultStatus);
          }
        }
      },
      error: (error) => {
        console.error('Error loading order status types:', error);
        this.snackBar.open(`Error al cargar estados de orden: ${error.message || 'Error desconocido'}`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  onCategoryOrProductSelectionChange(): void {
    console.log('onCategoryOrProductSelectionChange triggered.');
    console.log('Selected Category:', this.selectedCategory);
    console.log('Selected Product:', this.selectedProduct);
    this.filterAvailableProducts();
    if (!this.selectedProduct) {
      this.selectedQuantity = 1;
    }
  }

  filterAvailableProducts(): void {
    console.log('Filtering available products...');
    if (this.selectedCategory) {
      this.availableProducts = this.products.filter(product => 
        product.category?.id === this.selectedCategory!.id
      );
    } else {
      this.availableProducts = [...this.products];
    }
    console.log('Available products after filtering:', this.availableProducts);
  }

  addProduct(): void {
    console.log('Attempting to add product...');
    console.log('Selected Product for addition:', this.selectedProduct);
    console.log('Selected Quantity for addition:', this.selectedQuantity);

    if (this.selectedProduct && this.selectedQuantity > 0) {
      const existingDetailIndex = this.productDetails.findIndex(
        detail => detail.product.id === this.selectedProduct!.id
      );

      if (existingDetailIndex > -1) {
        this.productDetails[existingDetailIndex].amount += this.selectedQuantity;
        this.productDetails[existingDetailIndex].subtotal = 
          this.productDetails[existingDetailIndex].amount * this.selectedProduct.price;
      } else {
        this.productDetails.push({
          product: this.selectedProduct,
          amount: this.selectedQuantity,
          unitPrice: this.selectedProduct.price,
          subtotal: this.selectedQuantity * this.selectedProduct.price
        });
      }
      this.productDetails = [...this.productDetails];
      this.selectedProduct = null;
      this.selectedQuantity = 1;
      this.snackBar.open('Producto agregado correctamente', 'Cerrar', { duration: 2000 });
    } else {
      this.snackBar.open('Seleccione un producto y una cantidad válida', 'Cerrar', { duration: 3000 });
    }
  }

  removeProduct(index: number): void {
    this.productDetails.splice(index, 1);
    this.productDetails = [...this.productDetails];
  }

  calculateTotal(): number {
    return this.productDetails.reduce((sum, detail) => sum + detail.subtotal, 0);
  }

  onSubmit(): void {
    if (this.productDetails.length === 0) {
      this.snackBar.open('Debe agregar al menos un producto a la compra.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.salesTicketForm.invalid) {
      this.salesTicketForm.markAllAsTouched();
      return;
    }

    const formValue = this.salesTicketForm.getRawValue();
    const userId = formValue.user?.userId;

    if (!userId) {
      this.snackBar.open('Error: El cliente seleccionado no es válido.', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // CORRECCIÓN DE FECHA: Formatear la fecha para que no dependa de la zona horaria
    const saleDate = new Date(formValue.saleDate);
    const year = saleDate.getFullYear();
    const month = ('0' + (saleDate.getMonth() + 1)).slice(-2); // Los meses son base 0
    const day = ('0' + saleDate.getDate()).slice(-2);
    const hours = ('0' + saleDate.getHours()).slice(-2);
    const minutes = ('0' + saleDate.getMinutes()).slice(-2);
    const seconds = ('0' + saleDate.getSeconds()).slice(-2);
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;


    const salesTicketToSend: any = {
      saleDate: formattedDate,
      totalPayment: this.calculateTotal(),
      delivery: formValue.delivery,
      deliveryAddress: formValue.delivery === 'SI' ? formValue.deliveryAddress : null,
      note: formValue.note,
      user: { userId: userId },
      paymentType: { idPaymentType: formValue.paymentType.idPaymentType },
      orderStatusType: { idTypeState: formValue.orderStatusType.idTypeState },
      productDetails: this.productDetails.map(detail => ({
        amount: detail.amount,
        product: { id: detail.product.id }
      }))
    };
    
    console.log('Enviando payload al backend:', salesTicketToSend);

    // Si es edición, incluir ticketId. Si es creación, asegurarse de NO enviarlo.
    if (this.data.isEdit && this.data.salesTicket?.ticketId) {
        salesTicketToSend.ticketId = this.data.salesTicket.ticketId;
    } else {
        // Si existe por error, eliminarlo
        delete salesTicketToSend.ticketId;
    }

    const apiCall = this.data.isEdit && this.data.salesTicket?.ticketId
      ? this.salesTicketService.updateSalesTicket(this.data.salesTicket.ticketId, salesTicketToSend)
      : this.salesTicketService.createSalesTicket(salesTicketToSend);

    apiCall.subscribe({
      next: () => {
        this.snackBar.open('Operación realizada con éxito', 'Cerrar', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error al procesar la compra:', err);
        const errorMessage = err.error?.message || 'Error al procesar la compra. Intente de nuevo.';
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onQuantityChange(newValue: number): void {
    if (newValue < 1) {
      this.selectedQuantity = 1;
    } else {
      this.selectedQuantity = newValue;
    }
  }

  comparePaymentTypes(o1: PaymentType, o2: PaymentType): boolean {
    return o1 && o2 ? o1.idPaymentType === o2.idPaymentType : o1 === o2;
  }

  compareUsers(o1: RestaurantUser, o2: RestaurantUser): boolean {
    return o1 && o2 ? o1.userId === o2.userId : o1 === o2;
  }

  compareOrderStatusTypes(o1: OrderStatusType, o2: OrderStatusType): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
} 