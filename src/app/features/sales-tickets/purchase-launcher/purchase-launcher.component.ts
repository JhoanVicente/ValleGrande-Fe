import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SalesTicketDialogComponent } from '../sales-ticket-list/sales-ticket-dialog.component';

@Component({
  selector: 'app-purchase-launcher',
  standalone: true,
  imports: [],
  template: '',
})
export class PurchaseLauncherComponent implements OnInit {

  constructor(private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    const dialogRef = this.dialog.open(SalesTicketDialogComponent, {
      width: '80vw', // O el ancho que prefieras
      data: {
        isViewMode: false,
        salesTicket: null
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Al cerrar el diálogo, redirigir a la lista de compras
      this.router.navigate(['/sales-tickets']);
    });
  }
}
