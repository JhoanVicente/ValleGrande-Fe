// src/app/feature/product/product.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductListComponent } from './product-list/product-list.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: ProductListComponent },
  // puedes agregar rutas para crear o editar, si quieres
];

@NgModule({
  declarations: [ProductFormComponent, ProductListComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
  exports: [ProductListComponent, ProductFormComponent]
})
export class ProductModule {}
