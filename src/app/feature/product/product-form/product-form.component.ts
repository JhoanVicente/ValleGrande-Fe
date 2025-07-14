import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../core/interfaces/product';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  @Input() product?: Product; // para editar
  @Output() save = new EventEmitter<Product>();

  productForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      name: [this.product?.name || '', Validators.required],
      description: [this.product?.description || ''],
      price: [this.product?.price || '', [Validators.required, Validators.min(0.01)]],
      imageUrl: [this.product?.imageUrl || ''],
      categoryId: [this.product?.category?.id || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const productToSave: Product = {
        ...this.product,
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        imageUrl: formValue.imageUrl,
        category: { id: formValue.categoryId, name: '' } // nombre lo puede obtener backend
      };
      this.save.emit(productToSave);
    }
  }
}
