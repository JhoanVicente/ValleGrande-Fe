# 📘 Documentación del Frontend Angular RestLosPinos– *Restaurant Management System*

## 📝 Descripción General

Este proyecto es un frontend desarrollado con **Angular 19**, utilizando **componentes standalone**. Forma parte de un sistema de gestión para restaurantes, permitiendo administrar productos, categorías y usuarios mediante una interfaz intuitiva conectada a una **API REST**.

---

## 🧩 Estructura del Proyecto

El proyecto sigue una **arquitectura modular** y organizada de la siguiente manera:

```
src/app/
├── core/                  # Núcleo de la aplicación
│   ├── models/            # Interfaces de datos
│   └── services/          # Servicios para la API
├── features/              # Módulos de funcionalidad
│   ├── categories/        # Gestión de categorías
│   ├── products/          # Gestión de productos
│   └── users/             # Gestión de usuarios
├── layout/                # Componentes de diseño
│   └── header/            # Encabezado de la aplicación
├── shared/                # Componentes y módulos compartidos
│   ├── components/        # Componentes reutilizables
│   └── shared.module.ts   # Módulo con importaciones comunes
├── app.component.ts       # Componente principal
├── app.config.ts          # Configuración general
└── app.routes.ts          # Configuración de rutas
```

---

## 🛠️ Tecnologías Utilizadas

* **Angular 19** – Framework principal
* **Angular Material** – Biblioteca de UI
* **RxJS** – Programación reactiva
* **Standalone Components** – Componentes independientes

---

## 🔗 Conexión con la API

La aplicación se conecta a un backend mediante un servicio genérico `ApiService`:

```ts
export class ApiService {
  private baseUrl = 'http://localhost:8083';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data);
  }

  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`);
  }
}
```

---

## 🧾 Modelos de Datos

### 📦 `Product`

```ts
export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  status: boolean;
  imageUrl: string;
  category: Category;
  createdAt?: string;
}
```

### 👤 `RestaurantUser`

```ts
export interface RestaurantUser {
  userId?: number;
  userName: string;
  password: string;
  names: string;
  surnames: string;
  dateOfBirth: string;
  address: string;
  telephone: string;
  email: string;
  documentType: string;
  numberType: string;
  state: string; // 'A' o 'I'
  userType: UserType;
}
```

---

## 🔧 Servicios Específicos

Cada entidad tiene un servicio específico que extiende `ApiService`. Ejemplo:

```ts
export class ProductService {
  private endpoint = '/api/products';

  constructor(private apiService: ApiService) {}

  getAllProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>(this.endpoint);
  }

  // Otros métodos CRUD...
}
```

---

## 🧩 Componentes Principales

### 📋 Listado

```ts
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  statusFilter: boolean | 'all' = 'all';
  searchTerm: string = '';

  // Métodos para cargar y filtrar productos
}
```

### 📝 Diálogo (Agregar/Editar)

```ts
export class ProductDialogComponent {
  productForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData
  ) {
    this.productForm = this.fb.group({
      name: [data.product.name, [Validators.required, Validators.minLength(3)]],
      // Otras propiedades...
    });
  }

  // Guardar / Cancelar
}
```

---

## 🚦 Rutas de la Aplicación

```ts
export const routes: Routes = [
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/product-list/product-list.component')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/category-list/category-list.component')
        .then(m => m.CategoryListComponent)
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/user-list/user-list.component')
        .then(m => m.UserListComponent)
  },
  { path: '', redirectTo: '/products', pathMatch: 'full' }
];
```

---

## ✅ Funcionalidades Principales

### Productos

* Filtro por estado (activo/inactivo)
* Búsqueda por nombre
* Crear, editar y eliminar lógicamente
* Asociación con categorías

### Categorías

* Filtro por estado
* Búsqueda
* Crear, editar y eliminar lógicamente

### Usuarios

* Filtro por estado
* Búsqueda
* Crear, editar y eliminar lógicamente
* Asignación de tipo de usuario

---

## 🔄 Adaptación a Otra API

1. Cambia la URL base en `ApiService`:

   ```ts
   private baseUrl = 'https://tu-nueva-api.com';
   ```

2. Actualiza los endpoints en cada servicio:

   ```ts
   private endpoint = '/api/v1/products';
   ```

3. Modifica los modelos según la nueva estructura de datos.

4. Ajusta los componentes si el nuevo backend tiene validaciones o formatos distintos.

---

## 🚀 Ejecución del Proyecto

1. Asegúrate de tener **Node.js** y **npm** instalados.
2. Instala dependencias:

   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:

   ```bash
   ng serve
   ```
4. Abre en tu navegador:

   ```
   http://localhost:4200
   ```

---

## ⚙️ Consideraciones para el Desarrollo

* Uso de **Standalone Components** (sin necesidad de NgModules).
* Formularios basados en **Reactive Forms**.
* Comunicación con backend a través de **Observables (RxJS)**.
* Interfaz moderna con **Angular Material**.

---

## 📈 Extensión del Proyecto

Para agregar nuevas funcionalidades:

1. Crear modelos en `core/models/`
2. Agregar servicios en `core/services/`
3. Desarrollar componentes en `features/`
4. Añadir rutas en `app.routes.ts`

➡️ Siguiendo esta estructura se asegura **escalabilidad** y **mantenibilidad** del sistema.