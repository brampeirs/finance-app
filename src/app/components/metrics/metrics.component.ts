import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MetricsService } from '../../services/metrics.service';
import {
  CurrentMonthMetrics,
  DeltaMetrics,
  MetricsSummary,
  MetricsError,
} from '../../models/metrics.model';

@Component({
  selector: 'app-metrics',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Financial Metrics</h1>
        <button
          type="button"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          (click)="navigateToBalances()"
        >
          Back to Balances
        </button>
      </div>

      <!-- Date Range Selection -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Select Date Range</h2>
        <div class="flex gap-4 items-end">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
              Start Month
            </label>
            <input
              id="startDate"
              type="month"
              [(ngModel)]="startDate"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
              End Month
            </label>
            <input
              id="endDate"
              type="month"
              [(ngModel)]="endDate"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            [disabled]="loading()"
            (click)="loadMetrics()"
          >
            Load Metrics
          </button>
        </div>
      </div>

      @if (loading()) {
      <div class="text-center py-12">
        <p class="text-gray-600">Loading metrics...</p>
      </div>
      } @if (error()) {
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <p class="text-red-600 mb-4">{{ error() }}</p>
        <button
          type="button"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          (click)="loadMetrics()"
        >
          Try Again
        </button>
      </div>
      } @if (!loading() && !error() && hasData()) {
      <!-- KPIs Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        @if (summaryMetrics()) {
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">End Balance</h3>
          <p class="text-3xl font-bold text-blue-600">
            {{ formatCurrency(summaryMetrics()!.end_balance) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Change</h3>
          <p class="text-3xl font-bold" [class]="getTotalChangeClass()">
            {{ formatCurrency(summaryMetrics()!.total_change) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Last Month Delta</h3>
          <p class="text-3xl font-bold" [class]="getLastMonthDeltaClass()">
            {{ formatCurrency(summaryMetrics()!.last_month_delta) }}
          </p>
        </div>
        }
      </div>

      <!-- Monthly Data Table -->
      @if (deltaMetrics()) {
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Monthly Balance History</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Month
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Balance
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Delta
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (item of deltaMetrics()!.items; track item.month) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatMonth(item.month) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(item.balance) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" [class]="getDeltaClass(item.delta)">
                  {{ formatCurrency(item.delta) }}
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>

        @if (deltaMetrics()!.missing_months.length > 0) {
        <div class="px-6 py-4 bg-yellow-50 border-t border-gray-200">
          <p class="text-sm text-yellow-800">
            <strong>Missing data for months:</strong>
            {{ deltaMetrics()!.missing_months.join(', ') }}
          </p>
        </div>
        }
      </div>
      }

      <!-- Additional Summary Stats -->
      @if (summaryMetrics()) {
      <div class="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-sm text-gray-600">Start Balance</p>
            <p class="text-lg font-semibold">
              {{ formatCurrency(summaryMetrics()!.start_balance) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Avg Monthly Change</p>
            <p class="text-lg font-semibold">
              {{ formatCurrency(summaryMetrics()!.avg_monthly_change) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Positive Months</p>
            <p class="text-lg font-semibold text-green-600">
              {{ summaryMetrics()!.positive_months }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Negative Months</p>
            <p class="text-lg font-semibold text-red-600">
              {{ summaryMetrics()!.negative_months }}
            </p>
          </div>
        </div>
      </div>
      } }
    </div>
  `,
})
export class MetricsComponent implements OnInit {
  private readonly metricsService = inject(MetricsService);
  private readonly router = inject(Router);

  // Signals for state management
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly currentMonthMetrics = signal<CurrentMonthMetrics | null>(null);
  protected readonly deltaMetrics = signal<DeltaMetrics | null>(null);
  protected readonly summaryMetrics = signal<MetricsSummary | null>(null);

  // Form data
  protected startDate = '';
  protected endDate = '';

  // Computed properties
  protected readonly hasData = computed(
    () => this.deltaMetrics() !== null || this.summaryMetrics() !== null
  );

  ngOnInit(): void {
    // Set default date range (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    this.startDate = this.formatDateForInput(sixMonthsAgo);
    this.endDate = this.formatDateForInput(now);

    this.loadCurrentMonth();
    this.loadMetrics();
  }

  protected loadCurrentMonth(): void {
    this.metricsService.getCurrentMonthMetrics().subscribe({
      next: (metrics) => {
        this.currentMonthMetrics.set(metrics);
      },
      error: (err: MetricsError) => {
        console.error('Error loading current month metrics:', err);
        // Don't show error for current month as it's supplementary
      },
    });
  }

  protected loadMetrics(): void {
    if (!this.startDate || !this.endDate) {
      this.error.set('Please select both start and end dates');
      return;
    }

    if (this.startDate > this.endDate) {
      this.error.set('Start date must be before end date');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Load both delta and summary metrics
    forkJoin({
      delta: this.metricsService.getDeltaMetrics(this.startDate, this.endDate),
      summary: this.metricsService.getSummaryMetrics(this.startDate, this.endDate),
    }).subscribe({
      next: ({ delta, summary }) => {
        this.deltaMetrics.set(delta);
        this.summaryMetrics.set(summary);
        this.loading.set(false);
      },
      error: (err: MetricsError) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  protected navigateToBalances(): void {
    this.router.navigate(['/balances']);
  }

  protected formatCurrency(value: number | null): string {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  protected formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  protected formatDateForInput(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  protected getDeltaClass(delta: number | null): string {
    if (delta === null) return 'text-gray-500';
    return delta >= 0 ? 'text-green-600' : 'text-red-600';
  }

  protected getTotalChangeClass(): string {
    const totalChange = this.summaryMetrics()?.total_change;
    if (totalChange === null || totalChange === undefined) return 'text-gray-500';
    return totalChange >= 0 ? 'text-green-600' : 'text-red-600';
  }

  protected getLastMonthDeltaClass(): string {
    const lastMonthDelta = this.summaryMetrics()?.last_month_delta;
    if (lastMonthDelta === null || lastMonthDelta === undefined) return 'text-gray-500';
    return lastMonthDelta >= 0 ? 'text-green-600' : 'text-red-600';
  }
}
