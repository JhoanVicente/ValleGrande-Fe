import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReservationDetailService } from '../../../core/services/reservation-detail.service';
import { ReservationDetail } from '../../../core/models/reservation-detail.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ReservationDetailDialogComponent } from '../reservation-detail-dialog/reservation-detail-dialog.component';

@Component({
  selector: 'app-reservation-detail-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './reservation-detail-list.component.html',
  styleUrls: ['./reservation-detail-list.component.scss']
})
export class ReservationDetailListComponent implements OnInit {
  details: ReservationDetail[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { reservationId: number },
    private dialogRef: MatDialogRef<ReservationDetailListComponent>,
    private detailService: ReservationDetailService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails() {
    this.detailService.getByReservation(this.data.reservationId).subscribe(res => this.details = res);
  }

  openDetailDialog(detail?: ReservationDetail) {
    const dialogRef = this.dialog.open(ReservationDetailDialogComponent, {
      data: { detail, reservationId: this.data.reservationId },
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDetails();
    });
  }

  deleteDetail(detail: ReservationDetail) {
    if (detail.idReservationDetail) {
      this.detailService.setState(detail.idReservationDetail, 'I').subscribe(() => this.loadDetails());
    }
  }

  restoreDetail(detail: ReservationDetail) {
    if (detail.idReservationDetail) {
      this.detailService.setState(detail.idReservationDetail, 'A').subscribe(() => this.loadDetails());
    }
  }

  close() {
    this.dialogRef.close();
  }
} 