import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Reservation } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private endpoint = '/api/reservations';

  constructor(private api: ApiService) {}

  getAll(): Observable<Reservation[]> {
    return this.api.get<Reservation[]>(this.endpoint);
  }

  getActive(): Observable<Reservation[]> {
    return this.api.get<Reservation[]>(`${this.endpoint}/active`);
  }

  getCanceled(): Observable<Reservation[]> {
    return this.api.get<Reservation[]>(`${this.endpoint}/canceled`);
  }

  getByUser(userId: number): Observable<Reservation[]> {
    return this.api.get<Reservation[]>(`${this.endpoint}/user/${userId}`);
  }

  create(data: Reservation): Observable<Reservation> {
    return this.api.post<Reservation>(this.endpoint, data);
  }

  update(id: number, data: Reservation): Observable<Reservation> {
    return this.api.put<Reservation>(`${this.endpoint}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  restore(id: number): Observable<Reservation> {
    return this.api.put<Reservation>(`${this.endpoint}/${id}/restore`, {});
  }
} 