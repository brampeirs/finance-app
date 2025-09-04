import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Balance, CreateBalanceRequest } from '../models/balance.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/balance/`;

  getBalances(): Observable<Balance[]> {
    return this.http.get<Balance[]>(this.apiUrl);
  }

  createBalance(balance: CreateBalanceRequest): Observable<Balance> {
    return this.http.post<Balance>(this.apiUrl, balance);
  }

  deleteBalance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }
}
