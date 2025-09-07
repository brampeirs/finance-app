export interface CurrentMonthMetrics {
  month: string;
  balance: number;
  delta_vs_prev: number | null;
}

export interface MonthlyDelta {
  month: string;
  balance: number;
  delta: number | null;
}

export interface DeltaMetrics {
  range: {
    from: string;
    to: string;
  };
  items: MonthlyDelta[];
  missing_months: string[];
}

export interface MetricsSummary {
  range: {
    from: string;
    to: string;
  };
  start_balance: number | null;
  end_balance: number | null;
  total_change: number | null;
  avg_monthly_change: number | null;
  last_month_delta: number | null;
  positive_months: number;
  negative_months: number;
}

export interface MetricsError {
  message: string;
  status?: number;
}
