import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../../services/balance.service';
import { Balance } from '../../models/balance.model';

@Component({
  selector: 'app-balance-list',
  imports: [CommonModule],
  templateUrl: './balance-list.component.html',
  styleUrl: './balance-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceListComponent implements OnInit {
  private readonly balanceService = inject(BalanceService);
  private readonly router = inject(Router);

  protected readonly balances = signal<Balance[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBalances();
  }

  private loadBalances(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.balanceService.getBalances().subscribe({
      next: (balances) => {
        this.balances.set(balances);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load balances');
        this.loading.set(false);
        console.error('Error loading balances:', err);
      }
    });
  }

  protected onAddBalance(): void {
    this.router.navigate(['/balance/add']);
  }

  protected onRefresh(): void {
    this.loadBalances();
  }
}
