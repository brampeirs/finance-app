import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MetricsService } from './metrics.service';
import { CurrentMonthMetrics, DeltaMetrics, MetricsSummary } from '../models/metrics.model';
import { environment } from '../../environments/environment';

describe('MetricsService', () => {
  let service: MetricsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MetricsService]
    });
    service = TestBed.inject(MetricsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentMonthMetrics', () => {
    it('should fetch current month metrics', () => {
      const mockResponse: CurrentMonthMetrics = {
        month: '2025-09',
        balance: 1400.0,
        delta_vs_prev: 50.0
      };

      service.getCurrentMonthMetrics().subscribe(metrics => {
        expect(metrics).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/metrics/current-month`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle errors for current month metrics', () => {
      service.getCurrentMonthMetrics().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Server returned code 404');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/metrics/current-month`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getDeltaMetrics', () => {
    it('should fetch delta metrics with correct parameters', () => {
      const mockResponse: DeltaMetrics = {
        range: { from: '2025-01', to: '2025-06' },
        items: [
          { month: '2025-01', balance: 1000.0, delta: null },
          { month: '2025-03', balance: 1300.0, delta: 300.0 }
        ],
        missing_months: ['2025-02']
      };

      service.getDeltaMetrics('2025-01', '2025-06').subscribe(metrics => {
        expect(metrics).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/metrics/delta?start=2025-01&end=2025-06`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getSummaryMetrics', () => {
    it('should fetch summary metrics with correct parameters', () => {
      const mockResponse: MetricsSummary = {
        range: { from: '2025-01', to: '2025-06' },
        start_balance: 1000.0,
        end_balance: 1250.0,
        total_change: 250.0,
        avg_monthly_change: 125.0,
        last_month_delta: -50.0,
        positive_months: 1,
        negative_months: 1
      };

      service.getSummaryMetrics('2025-01', '2025-06').subscribe(metrics => {
        expect(metrics).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/metrics/summary?start=2025-01&end=2025-06`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle server errors', () => {
      service.getSummaryMetrics('2025-01', '2025-06').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Server error occurred');
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/metrics/summary?start=2025-01&end=2025-06`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle bad request errors', () => {
      service.getSummaryMetrics('invalid', 'dates').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Invalid request parameters');
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/metrics/summary?start=invalid&end=dates`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });
});
