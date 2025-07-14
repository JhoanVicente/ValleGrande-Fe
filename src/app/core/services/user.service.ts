import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestaurantUser } from '../models/restaurant-user.model';
import { UserType } from '../models/user-type.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private endpoint = '/api/users';
  private userTypeEndpoint = '/api/user-types';

  constructor(private apiService: ApiService) {}

  getAllUsers(): Observable<RestaurantUser[]> {
    return this.apiService.get<RestaurantUser[]>(this.endpoint);
  }

  getUserById(id: number): Observable<RestaurantUser> {
    return this.apiService.get<RestaurantUser>(`${this.endpoint}/${id}`);
  }

  createUser(user: RestaurantUser): Observable<RestaurantUser> {
    return this.apiService.post<RestaurantUser>(this.endpoint, user);
  }

  updateUser(id: number, user: RestaurantUser): Observable<RestaurantUser> {
    return this.apiService.put<RestaurantUser>(`${this.endpoint}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.apiService.delete(`${this.endpoint}/logical/${id}`);
  }

  activateUser(id: number): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/restore/${id}`, {});
  }

  getUserTypes(): Observable<UserType[]> {
    return this.apiService.get<UserType[]>(this.userTypeEndpoint);
  }
}