import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ReservationDetail } from '../models/reservation-detail.model';

@Injectable({ providedIn: 'root' })
export class ReservationDetailService {
  private endpoint = '/api/reservation-details';

  constructor(private api: ApiService) {}

  getByReservation(reservationId: number): Observable<ReservationDetail[]> {
    return this.api.get<ReservationDetail[]>(`${this.endpoint}/reservation/${reservationId}`);
  }

  create(detail: ReservationDetail): Observable<ReservationDetail> {
    return this.api.post<ReservationDetail>(this.endpoint, detail);
  }

  update(id: number, detail: ReservationDetail): Observable<ReservationDetail> {
    return this.api.put<ReservationDetail>(`${this.endpoint}/${id}`, detail);
  }

  delete(id: number): Observable<any> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  setState(id: number, state: 'A' | 'I'): Observable<ReservationDetail> {
    return this.api.put<ReservationDetail>(`${this.endpoint}/${id}/state`, { state });
  }
} 