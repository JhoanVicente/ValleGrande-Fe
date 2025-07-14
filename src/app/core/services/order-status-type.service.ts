import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { OrderStatusType } from '../models/order-status-type.model';

@Injectable({ providedIn: 'root' })
export class OrderStatusTypeService {
  private endpoint = '/api/order-status-types';

  constructor(private api: ApiService) {}

  getAll(): Observable<OrderStatusType[]> {
    return this.api.get<OrderStatusType[]>(this.endpoint);
  }
} 