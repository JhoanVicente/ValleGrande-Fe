import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Category } from '../../../core/models/category.model';

interface DialogData {
  title: string;
  category: Category;
  isEdit: boolean;
}

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>

    <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="w-100">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" placeholder="Nombre de la categoría" />
          <mat-error *ngIf="name?.hasError('required')">El nombre es obligatorio.</mat-error>
          <mat-error *ngIf="name?.hasError('maxlength')">Máximo 100 caracteres.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="w-100">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" placeholder="Descripción (opcional)"></textarea>
          <mat-error *ngIf="description?.hasError('maxlength')">Máximo 255 caracteres.</mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit">{{ isEdit ? 'Actualizar' : 'Crear' }}</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .w-100 { width: 100%; }
  `]
})
export class CategoryDialogComponent implements OnInit {
  categoryForm!: FormGroup;
  title = '';
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.title = this.data.title;
    this.isEdit = this.data.isEdit;

    this.categoryForm = this.fb.group({
      name: [this.data.category.name, [Validators.required, Validators.maxLength(100)]],
      description: [this.data.category.description || '', [Validators.maxLength(255)]],
    });
  }

  get name() { return this.categoryForm.get('name'); }
  get description() { return this.categoryForm.get('description'); }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.value;

    const categoryToSend: Category = {
      ...this.data.category,
      name: formValue.name,
      description: formValue.description
    };

    this.dialogRef.close(categoryToSend);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
