import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { RestaurantTable } from '../models/restaurant-table.model';

@Injectable({ providedIn: 'root' })
export class RestaurantTableService {
  private endpoint = '/api/tables';

  constructor(private api: ApiService) {}

  getAll(): Observable<RestaurantTable[]> {
    return this.api.get<RestaurantTable[]>(this.endpoint);
  }
} 