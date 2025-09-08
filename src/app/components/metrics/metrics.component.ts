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
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss',
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
    if (delta === null) return 'text-gray-500 dark:text-gray-400';
    return delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  protected getTotalChangeClass(): string {
    const totalChange = this.summaryMetrics()?.total_change;
    if (totalChange === null || totalChange === undefined)
      return 'text-gray-500 dark:text-gray-400';
    return totalChange >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  }

  protected getLastMonthDeltaClass(): string {
    const lastMonthDelta = this.summaryMetrics()?.last_month_delta;
    if (lastMonthDelta === null || lastMonthDelta === undefined)
      return 'text-gray-500 dark:text-gray-400';
    return lastMonthDelta >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  }
}
