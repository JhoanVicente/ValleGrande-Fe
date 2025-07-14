import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

interface DialogData {
  title: string;
  product: Product;
  categories: Category[];
  isEdit: boolean;
  existingProducts: Product[];
}

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ]
})
export class ProductDialogComponent {
  productForm: FormGroup;
  title: string;
  categories: Category[];
  isEdit: boolean;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.title = data.title;
    this.categories = data.categories;
    this.isEdit = data.isEdit;
    
    this.productForm = this.fb.group({
      name: [data.product.name, [
        Validators.required, 
        Validators.maxLength(100), 
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/)
      ]],
      description: [data.product.description, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      price: [data.product.price, [
        Validators.required, 
        Validators.min(0.01),
        Validators.max(9999.99),
        Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)
      ]],
      status: [data.product.status],
      imageUrl: [data.product.imageUrl, [
        Validators.pattern(/^(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png|svg)$/)
      ]],
      category: [data.product.category?.id, [
        Validators.required
      ]]
    });
  }

  get name() { return this.productForm.get('name'); }
  get description() { return this.productForm.get('description'); }
  get price() { return this.productForm.get('price'); }
  get category() { return this.productForm.get('category'); }
  get imageUrl() { return this.productForm.get('imageUrl'); }

  onSubmit(): void {
    this.errorMessage = null;
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const selectedCategory = this.categories.find(cat => cat.id === formValue.category);
      if (!selectedCategory) {
        this.errorMessage = 'Categoría no encontrada';
        return;
      }
      // Validación de nombre duplicado (case-insensitive)
      const nameToCheck = formValue.name.trim().toLowerCase();
      const exists = this.data.existingProducts.some((p: Product) => p.name.trim().toLowerCase() === nameToCheck);
      if (exists) {
        this.errorMessage = 'Ya existe un producto con ese nombre.';
        return;
      }
      const productData = {
        name: formValue.name,
        description: formValue.description || '',
        price: formValue.price,
        status: formValue.status,
        imageUrl: formValue.imageUrl || '',
        category: {
          id: selectedCategory.id
        }
      };
      this.dialogRef.close(productData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}