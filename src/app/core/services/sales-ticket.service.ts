import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SalesTicket } from '../models/sales-ticket.model';
import { ApiService } from './api.service';
import { OrderStatusType } from '../models/order-status-type.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesTicketService {
  private endpoint = '/api/sales';

  constructor(private apiService: ApiService) { }

  // Obtener todos los tickets de venta
  getAllSalesTickets(): Observable<SalesTicket[]> {
    return this.apiService.get<SalesTicket[]>(this.endpoint);
  }

  // Obtener un ticket de venta por ID
  getSalesTicket(id: number): Observable<SalesTicket> {
    return this.apiService.get<SalesTicket>(`${this.endpoint}/${id}`);
  }

  // Crear un nuevo ticket de venta
  createSalesTicket(salesTicket: SalesTicket): Observable<SalesTicket> {
    return this.apiService.post<SalesTicket>(this.endpoint, salesTicket);
  }

  // Actualizar un ticket de venta
  updateSalesTicket(id: number, salesTicket: SalesTicket): Observable<SalesTicket> {
    return this.apiService.put<SalesTicket>(`${this.endpoint}/${id}`, salesTicket);
  }

  // Eliminar un ticket de venta
  deleteSalesTicket(id: number): Observable<void> {
    return this.apiService.delete(`${this.endpoint}/${id}`);
  }

  // Obtener tickets por estado
  getSalesTicketsByStatus(status: string): Observable<SalesTicket[]> {
    return this.apiService.get<SalesTicket[]>(`${this.endpoint}/status/${status}`);
  }

  // Obtener tickets inactivos
  getInactiveSalesTickets(): Observable<SalesTicket[]> {
    return this.apiService.get<SalesTicket[]>(`${this.endpoint}/inactive`);
  }

  // Restaurar un ticket
  restoreSalesTicket(id: number): Observable<SalesTicket> {
    return this.apiService.post<SalesTicket>(`${this.endpoint}/${id}/restore`, {});
  }

  // Obtener todos los tipos de estado (para el borrado lógico/restauración)
  getOrderStatusTypes(): Observable<OrderStatusType[]> {
    return this.apiService.get<OrderStatusType[]>(`/api/orderstatustypes`);
  }

  // Obtener tickets por usuario
  getSalesTicketsByUserId(userId: number): Observable<SalesTicket[]> {
    return this.apiService.get<SalesTicket[]>(`${this.endpoint}/user/${userId}`);
  }

  // Descargar el PDF de un ticket de venta
  downloadSalesTicketPdf(ticketId: number): Observable<Blob> {
    return this.apiService.getBlob(`/api/sales/pdf/${ticketId}`);
  }
} 