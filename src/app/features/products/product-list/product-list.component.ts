import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductDialogComponent } from '../../../features/products/product-list/product-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    ProductDialogComponent,
    ConfirmDialogComponent,
    MatSnackBarModule
  ]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';
  showInactive = false;
  displayedColumns: string[] = ['id', 'imageUrl', 'name', 'description', 'price', 'category', 'status', 'actions'];
  dataSource: MatTableDataSource<Product>;

  // Propiedades para la paginación
  totalProductsCount = 0;
  pageSize = 8; // Número de elementos por página por defecto
  pageIndex = 0; // Índice de la página actual (basado en 0)
  pageSizeOptions: number[] = [5, 8, 10, 25, 50, 100]; // Opciones de tamaño de página

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchControl = new FormControl('');
  categoryFilterControl = new FormControl('');
  statusFilterControl = new FormControl('');
  userRole: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Product>([]);
    this.userRole = this.authService.getUserRole();
    
    // Ocultar la columna de acciones si el usuario no es administrador
    if (this.userRole !== 'Administrador') {
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'actions');
    }
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.setupFilters();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    
    // Configurar el ordenamiento
    this.dataSource.sortingDataAccessor = (item: Product, property: string): string | number => {
      switch(property) {
        case 'id': return Number(item.id) || 0;
        case 'price': return Number(item.price) || 0;
        case 'name': return item.name?.toLowerCase() || '';
        case 'category': return item.category?.name?.toLowerCase() || '';
        case 'status': return item.status ? '1' : '0';
        default: return '';
      }
    };

    // Asegurar que el ordenamiento y paginación se apliquen inmediatamente
    this.sort.sortChange.subscribe(() => {
      this.pageIndex = 0; // Resetear la página al cambiar el orden
      this.applyFilteringAndPagination();
    });
    this.paginator.page.subscribe(() => this.applyFilteringAndPagination());
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    const obs = this.showInactive
      ? this.productService.getInactiveProducts()
      : this.productService.getProducts();
    obs.subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.applyFilteringAndPagination(); // Aplicar filtros y paginación inicial
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error completo:', error);
        this.error = `Error al cargar los productos: ${error.message || 'Error desconocido'}`;
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (error: any) => {
        console.error('Error al cargar las categorías:', error);
        this.error = `Error al cargar las categorías: ${error.message || 'Error desconocido'}`;
      }
    });
  }

  toggleInactive(): void {
    this.showInactive = !this.showInactive;
    this.pageIndex = 0; // Resetear la página al cambiar el filtro de estado
    this.loadProducts();
  }

  restoreProduct(id: number): void {
    this.productService.restoreProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (error: any) => {
        this.error = 'Error al restaurar el producto';
      }
    });
  }

  // Validación de Nombre Duplicado en Productos
  openProductDialog(product?: Product): void {
    const productsForValidation = this.products.filter(p => !product || p.id !== product.id);
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: {
        title: product ? 'Editar Producto' : 'Nuevo Producto',
        product: product || {
          name: '',
          description: '',
          price: 0,
          status: true,
          imageUrl: '',
          category: null
        },
        categories: this.categories,
        isEdit: !!product,
        existingProducts: productsForValidation
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (product?.id) {
          this.productService.updateProduct(product.id, result).subscribe({
            next: () => {
              this.loadProducts();
            },
            error: (error: any) => {
              console.error('Error al actualizar:', error);
              this.error = 'Error al actualizar el producto';
            }
          });
        } else {
          this.productService.createProduct(result).subscribe({
            next: () => {
              this.loadProducts();
            },
            error: (error: any) => {
              console.error('Error al crear:', error);
              this.error = 'Error al crear el producto';
            }
          });
        }
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      const product = this.products.find(p => p.id === id);
      if (!product) {
        this.error = 'Producto no encontrado';
        return;
      }
      const updatedProduct = { ...product, status: false };
      this.productService.updateProduct(id, updatedProduct).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error: any) => {
          this.error = 'Error al eliminar el producto';
        }
      });
    }
  }

  setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 0; // Resetear la página al cambiar el filtro de búsqueda
      this.applyFilteringAndPagination();
    });

    this.categoryFilterControl.valueChanges.subscribe(() => {
      this.pageIndex = 0; // Resetear la página al cambiar el filtro de categoría
      this.applyFilteringAndPagination();
    });
    this.statusFilterControl.valueChanges.subscribe(() => {
      this.pageIndex = 0; // Resetear la página al cambiar el filtro de estado
      this.applyFilteringAndPagination();
    });
  }

  applyFilteringAndPagination(): void {
    let filteredProducts = this.products.filter(product => {
      const searchMatch = (product.name?.toLowerCase().includes(this.searchControl.value?.toLowerCase() || '') ||
        product.description?.toLowerCase().includes(this.searchControl.value?.toLowerCase() || ''));

      const categoryFilterValue = this.categoryFilterControl.value;
      const categoryMatch = !categoryFilterValue || 
        (product.category?.id !== undefined && product.category.id === (typeof categoryFilterValue === 'string' ? Number(categoryFilterValue) : categoryFilterValue));

      const statusValue = this.statusFilterControl.value;
      const statusMatch = statusValue === '' || 
        product.status?.toString() === statusValue;

      return searchMatch && categoryMatch && statusMatch;
    });

    // Aplicar ordenamiento
    if (this.sort.active && this.sort.direction !== '') {
      filteredProducts = filteredProducts.sort((a, b) => {
        const isAsc = this.sort.direction === 'asc';
        switch (this.sort.active) {
          case 'id': return compare(a.id || 0, b.id || 0, isAsc);
          case 'name': return compare(a.name || '', b.name || '', isAsc);
          case 'description': return compare(a.description || '', b.description || '', isAsc);
          case 'price': return compare(a.price || 0, b.price || 0, isAsc);
          case 'category': return compare(a.category?.name || '', b.category?.name || '', isAsc);
          case 'status': return compare(a.status || false, b.status || false, isAsc);
          default: return 0;
        }
      });
    }

    this.totalProductsCount = filteredProducts.length;

    // Aplicar paginación manual
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    this.dataSource.data = paginatedProducts;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilteringAndPagination();
  }

  // Descargar reporte de productos activos
  downloadActiveProductsReport(): void {
    this.productService.downloadActiveProductsReport().subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        this.snackBar.open('Reporte de productos activos descargado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error al descargar el reporte:', error);
        this.snackBar.open('Error al descargar el reporte de productos activos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // Descargar reporte de productos inactivos
  downloadInactiveProductsReport(): void {
    this.productService.downloadInactiveProductsReport().subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        this.snackBar.open('Reporte de productos inactivos descargado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error al descargar el reporte:', error);
        this.snackBar.open('Error al descargar el reporte de productos inactivos', 'Cerrar', { duration: 3000 });
      }
    });
  }
}

function compare(a: string | number | boolean, b: string | number | boolean, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}