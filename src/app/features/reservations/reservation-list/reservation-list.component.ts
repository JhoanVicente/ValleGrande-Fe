import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation } from '../../../core/models/reservation.model';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationDialogComponent } from '../reservation-dialog/reservation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { ReservationDetailListComponent } from '../reservation-detail-list/reservation-detail-list.component';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.scss']
})
export class ReservationListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Reservation>();
  displayedColumns: string[] = ['reservationName', 'reservationDate', 'orderStatusType', 'actions'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private reservationService: ReservationService,
    public authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadReservations() {
    this.reservationService.getAll().subscribe(res => {
      this.dataSource.data = res;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(reservation?: Reservation) {
    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      data: { reservation },
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadReservations();
    });
  }

  deleteReservation(reservation: Reservation) {
    if (reservation.reservationId) {
      this.reservationService.delete(reservation.reservationId).subscribe(() => this.loadReservations());
    }
  }

  restoreReservation(reservation: Reservation) {
    if (reservation.reservationId) {
      this.reservationService.restore(reservation.reservationId).subscribe(() => this.loadReservations());
    }
  }

  openDetails(reservation: Reservation) {
    if (!this.authService.isAdmin()) return;
    this.dialog.open(ReservationDetailListComponent, {
      data: { reservationId: reservation.reservationId },
      width: '700px'
    });
  }
} 