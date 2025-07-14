import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RestaurantTableService } from '../../../core/services/restaurant-table.service';
import { ReservationDetailService } from '../../../core/services/reservation-detail.service';
import { RestaurantTable } from '../../../core/models/restaurant-table.model';
import { ReservationDetail } from '../../../core/models/reservation-detail.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reservation-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './reservation-detail-dialog.component.html',
  styleUrls: ['./reservation-detail-dialog.component.scss']
})
export class ReservationDetailDialogComponent implements OnInit {
  form: FormGroup;
  tables$!: Observable<RestaurantTable[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservationDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { detail?: ReservationDetail, reservationId: number },
    private tableService: RestaurantTableService,
    private detailService: ReservationDetailService
  ) {
    this.form = this.fb.group({
      numberPeople: [data?.detail?.numberPeople || '', [Validators.required, Validators.min(1), Validators.max(8)]],
      reservationMethod: [data?.detail?.reservationMethod || '', Validators.required],
      request: [data?.detail?.request || ''],
      table: [data?.detail?.table || null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.tables$ = this.tableService.getAll();
  }

  save() {
    if (this.form.invalid) return;
    const value = this.form.value;
    const detail: ReservationDetail = {
      ...this.data.detail,
      ...value,
      reservationId: this.data.reservationId
    };
    if (this.data.detail?.idReservationDetail) {
      this.detailService.update(this.data.detail.idReservationDetail, detail).subscribe(() => this.dialogRef.close(true));
    } else {
      this.detailService.create(detail).subscribe(() => this.dialogRef.close(true));
    }
  }

  close() {
    this.dialogRef.close();
  }
} 