import { Routes } from '@angular/router';
import { SalesTicketListComponent } from './sales-ticket-list/sales-ticket-list.component';
import { PurchaseLauncherComponent } from './purchase-launcher/purchase-launcher.component';

export const SALES_TICKET_ROUTES: Routes = [
  {
    path: '',
    component: SalesTicketListComponent
  },
  {
    path: 'purchase-launcher',
    component: PurchaseLauncherComponent
  }
]; 