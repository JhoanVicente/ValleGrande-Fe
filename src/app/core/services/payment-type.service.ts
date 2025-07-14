import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentType } from '../models/payment-type.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentTypeService {
  private apiUrl = `${environment.apiUrl}/api/payment-types`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getPaymentTypes(): Observable<PaymentType[]> {
    return this.http.get<PaymentType[]>(this.apiUrl, this.httpOptions);
  }

  getPaymentType(id: number): Observable<PaymentType> {
    return this.http.get<PaymentType>(`${this.apiUrl}/${id}`, this.httpOptions);
  }
} 