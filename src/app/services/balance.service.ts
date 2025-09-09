import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Balance, CreateBalanceRequest, BalanceError } from '../models/balance.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/balance/`;

  getBalances(): Observable<Balance[]> {
    return this.http.get<Balance[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  createBalance(balance: CreateBalanceRequest): Observable<Balance> {
    return this.http.post<Balance>(this.apiUrl, balance).pipe(catchError(this.handleError));
  }

  deleteBalance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`).pipe(catchError(this.handleError));
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid balance data provided';
          break;
        case 404:
          errorMessage = 'Balance not found';
          break;
        case 409:
          errorMessage =
            'A balance for this month already exists. Please update the existing balance instead.';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
    }

    const balanceError: BalanceError = {
      message: errorMessage,
      status: error.status,
    };

    console.error('Balance service error:', error);
    return throwError(() => balanceError);
  };
}
