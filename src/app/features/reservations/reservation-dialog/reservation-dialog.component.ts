import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReservationService } from '../../../core/services/reservation.service';
import { OrderStatusTypeService } from '../../../core/services/order-status-type.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Reservation } from '../../../core/models/reservation.model';
import { RestaurantUser } from '../../../core/models/restaurant-user.model';
import { OrderStatusType } from '../../../core/models/order-status-type.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable } from 'rxjs';
import { ReservationDetailService } from '../../../core/services/reservation-detail.service';
import { RestaurantTableService } from '../../../core/services/restaurant-table.service';
import { RestaurantTable } from '../../../core/models/restaurant-table.model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './reservation-dialog.component.html',
  styleUrls: ['./reservation-dialog.component.scss']
})
export class ReservationDialogComponent implements OnInit {
  form: FormGroup;
  statusTypes$!: Observable<OrderStatusType[]>;
  users$!: Observable<RestaurantUser[]>;
  tables$!: Observable<RestaurantTable[]>;
  isAdmin: boolean;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reservation?: Reservation },
    private reservationService: ReservationService,
    private statusTypeService: OrderStatusTypeService,
    private authService: AuthService,
    private userService: UserService,
    private detailService: ReservationDetailService,
    private tableService: RestaurantTableService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.form = this.fb.group({
      reservationName: [data?.reservation?.reservationName || '', [Validators.required, Validators.maxLength(90)]],
      reservationDate: [data?.reservation?.reservationDate ? new Date(data.reservation.reservationDate) : '', Validators.required],
      reservationTime: [data?.reservation?.reservationDate ? this.formatTime(new Date(data.reservation.reservationDate)) : '', Validators.required],
      orderStatusType: [data?.reservation?.orderStatusType || null, Validators.required],
      restaurantUser: [data?.reservation?.restaurantUser || null, Validators.required],
      numberPeople: ['', [Validators.required, Validators.min(1), Validators.max(8)]],
      reservationMethod: ['Online', Validators.required],
      request: [''],
      table: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.statusTypes$ = this.statusTypeService.getAll();
    this.tables$ = this.tableService.getAll();
    if (this.isAdmin) {
      this.users$ = this.userService.getAllUsers();
    } else {
      const userId = this.authService.getUserId();
      this.form.patchValue({ restaurantUser: { userId } });
      this.form.get('restaurantUser')?.disable();
    }
  }

  save() {
    if (this.form.invalid) return;
    
    const { 
      reservationDate, reservationTime, numberPeople, reservationMethod, request, table, ...reservationRest 
    } = this.form.getRawValue();
    
    const [hours, minutes] = reservationTime.split(':');
    const combinedDate = new Date(reservationDate);
    combinedDate.setHours(hours, minutes);

    const reservationData = { ...reservationRest, reservationDate: combinedDate.toISOString() };

    if (!this.data?.reservation?.reservationId) {
      this.reservationService.create(reservationData).pipe(
        switchMap(createdReservation => {
          const detailData = {
            numberPeople,
            reservationMethod,
            request,
            table,
            reservation: { reservationId: createdReservation.reservationId! }
          };
          return this.detailService.create(detailData as any);
        })
      ).subscribe(() => this.dialogRef.close(true));
    } else {
      this.reservationService.update(this.data.reservation.reservationId!, reservationData).subscribe(() => this.dialogRef.close(true));
    }
  }

  close() {
    this.dialogRef.close();
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  compareUsers(u1: RestaurantUser, u2: RestaurantUser): boolean {
    return u1 && u2 ? u1.userId === u2.userId : u1 === u2;
  }

  compareStatus(s1: OrderStatusType, s2: OrderStatusType): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  compareTables(t1: RestaurantTable, t2: RestaurantTable): boolean {
    return t1 && t2 ? t1.tableId === t2.tableId : t1 === t2;
  }
} 