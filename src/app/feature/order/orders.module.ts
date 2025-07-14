import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';

const routes: Routes = [
  { path: '', component: OrderListComponent }
];

@NgModule({
  declarations: [
    OrderListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)  // Importa rutas hijas para lazy loading
  ]
})
export class OrdersModule {}
