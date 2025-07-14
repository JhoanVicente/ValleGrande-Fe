import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RestaurantUser } from '../../../core/models/restaurant-user.model';
import { UserType } from '../../../core/models/user-type.model';

export interface UserDialogData {
  title: string;
  user: RestaurantUser;
  userTypes: UserType[];
  isEdit: boolean;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <form [formGroup]="userForm" (ngSubmit)="onSave()">
      <div mat-dialog-content class="dialog-content">
        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Nombre de Usuario</mat-label>
              <input matInput formControlName="userName" placeholder="Nombre de usuario">
              <mat-error *ngIf="userForm.get('userName')?.hasError('required')">El nombre de usuario es obligatorio</mat-error>
              <mat-error *ngIf="userForm.get('userName')?.hasError('minlength')">El nombre de usuario debe tener al menos 3 caracteres</mat-error>
            </mat-form-field>
          </div>
          
          <div class="col-md-6" *ngIf="!data.isEdit">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" placeholder="Contraseña">
              <mat-error *ngIf="userForm.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
              <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">La contraseña debe tener al menos 6 caracteres</mat-error>
            </mat-form-field>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Nombres</mat-label>
              <input matInput formControlName="names" placeholder="Nombres">
              <mat-error *ngIf="userForm.get('names')?.hasError('required')">Los nombres son obligatorios</mat-error>
            </mat-form-field>
          </div>
          
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Apellidos</mat-label>
              <input matInput formControlName="surnames" placeholder="Apellidos">
              <mat-error *ngIf="userForm.get('surnames')?.hasError('required')">Los apellidos son obligatorios</mat-error>
            </mat-form-field>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Fecha de Nacimiento</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateOfBirth">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="userForm.get('dateOfBirth')?.hasError('required')">La fecha de nacimiento es obligatoria</mat-error>
            </mat-form-field>
          </div>
          
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Dirección</mat-label>
              <input matInput formControlName="address" placeholder="Dirección">
              <mat-error *ngIf="userForm.get('address')?.hasError('required')">La dirección es obligatoria</mat-error>
            </mat-form-field>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="telephone" placeholder="Teléfono">
              <mat-error *ngIf="userForm.get('telephone')?.hasError('required')">El teléfono es obligatorio</mat-error>
              <mat-error *ngIf="userForm.get('telephone')?.hasError('pattern')">El teléfono debe contener solo números</mat-error>
            </mat-form-field>
          </div>
          
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" placeholder="Email">
              <mat-error *ngIf="userForm.get('email')?.hasError('required')">El email es obligatorio</mat-error>
              <mat-error *ngIf="userForm.get('email')?.hasError('email')">El email no es válido</mat-error>
            </mat-form-field>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Tipo de Documento</mat-label>
              <mat-select formControlName="documentType">
                <mat-option value="DNI">DNI</mat-option>
                <mat-option value="PASAPORTE">Pasaporte</mat-option>
                <mat-option value="CARNET_EXTRANJERIA">Carnet de Extranjería</mat-option>
              </mat-select>
              <mat-error *ngIf="userForm.get('documentType')?.hasError('required')">El tipo de documento es obligatorio</mat-error>
            </mat-form-field>
          </div>
          
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Número de Documento</mat-label>
              <input matInput formControlName="numberType" placeholder="Número de documento">
              <mat-error *ngIf="userForm.get('numberType')?.hasError('required')">El número de documento es obligatorio</mat-error>
            </mat-form-field>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Tipo de Usuario</mat-label>
              <mat-select formControlName="userType" [compareWith]="compareUserTypes">
                <mat-option *ngFor="let type of data.userTypes" [value]="type">
                  {{ type.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <div class="col-md-6" *ngIf="data.isEdit">
            <mat-form-field appearance="outline" class="w-100 mb-3">
              <mat-label>Estado</mat-label>
              <mat-select formControlName="state">
                <mat-option value="A">Activo</mat-option>
                <mat-option value="I">Inactivo</mat-option>
              </mat-select>
              <mat-error *ngIf="userForm.get('state')?.hasError('required')">El estado es obligatorio</mat-error>
            </mat-form-field>
          </div>
        </div>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid">
          Guardar
        </button>
      </div>
    </form>
  `,
  styles: [`
    .w-100 { width: 100%; }
    .mb-3 { margin-bottom: 1rem; }
    .dialog-content { max-height: 70vh; overflow-y: auto; }
    .row { display: flex; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; }
    .col-md-6 { flex: 0 0 50%; max-width: 50%; padding-right: 15px; padding-left: 15px; }
  `]
})
export class UserDialogComponent {
  userForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.userForm = this.fb.group({
      userName: [data.user.userName, [Validators.required, Validators.minLength(3)]],
      password: [data.isEdit ? '' : data.user.password, data.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      names: [data.user.names, [Validators.required]],
      surnames: [data.user.surnames, [Validators.required]],
      dateOfBirth: [data.user.dateOfBirth ? new Date(data.user.dateOfBirth) : null, [Validators.required]],
      address: [data.user.address, [Validators.required]],
      telephone: [data.user.telephone, [Validators.required, Validators.pattern('^[0-9]*$')]],
      email: [data.user.email, [Validators.required, Validators.email]],
      documentType: [data.user.documentType, [Validators.required]],
      numberType: [data.user.numberType, [Validators.required]],
      state: [data.user.state, data.isEdit ? [Validators.required] : []],
      userType: [data.user.userType, [Validators.required]]
    });
  }

  compareUserTypes(type1: UserType, type2: UserType): boolean {
    return type1 && type2 ? type1.userTypeId === type2.userTypeId : type1 === type2;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Crear un objeto para enviar, combinando datos originales y del formulario
      const userToSave: RestaurantUser = {
        ...this.data.user,
        ...formValue
      };

      // Formatear userType para enviar tanto el userTypeId como el nombre (como lo espera el modelo UserType del frontend)
      if (formValue.userType && formValue.userType.userTypeId) {
        userToSave.userType = { userTypeId: formValue.userType.userTypeId, name: formValue.userType.name };
      }

      // Formatear la fecha de nacimiento a string ISO (YYYY-MM-DD)
      if (formValue.dateOfBirth instanceof Date) {
        userToSave.dateOfBirth = formValue.dateOfBirth.toISOString().split('T')[0];
      }

      // Si es un nuevo usuario, establecemos el estado como activo por defecto
      if (!this.data.isEdit) {
        userToSave.state = 'A';
      }
      
      // Si estamos editando y no se proporcionó una nueva contraseña, mantenemos la original
      if (this.data.isEdit && !formValue.password) {
        userToSave.password = this.data.user.password; 
      }

      this.dialogRef.close(userToSave);
    }
  }
}