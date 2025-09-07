import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CurrentMonthMetrics,
  DeltaMetrics,
  MetricsSummary,
  MetricsError,
} from '../models/metrics.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/metrics`;

  getCurrentMonthMetrics(): Observable<CurrentMonthMetrics> {
    return this.http
      .get<CurrentMonthMetrics>(`${this.apiUrl}/current-month/`)
      .pipe(catchError(this.handleError));
  }

  getDeltaMetrics(start: string, end: string): Observable<DeltaMetrics> {
    const params = { start, end };
    return this.http
      .get<DeltaMetrics>(`${this.apiUrl}/delta/`, { params })
      .pipe(catchError(this.handleError));
  }

  getSummaryMetrics(start: string, end: string): Observable<MetricsSummary> {
    const params = { start, end };
    return this.http
      .get<MetricsSummary>(`${this.apiUrl}/summary/`, { params })
      .pipe(catchError(this.handleError));
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
          errorMessage = 'Invalid request parameters';
          break;
        case 404:
          errorMessage = 'Metrics data not found';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
    }

    const metricsError: MetricsError = {
      message: errorMessage,
      status: error.status,
    };

    console.error('Metrics service error:', error);
    return throwError(() => metricsError);
  };
}
