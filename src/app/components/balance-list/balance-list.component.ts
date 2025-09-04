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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceListComponent implements OnInit {
  private readonly balanceService = inject(BalanceService);
  private readonly router = inject(Router);

  readonly balances = signal<Balance[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal<number | null>(null);
  readonly showDeleteConfirm = signal<number | null>(null);

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
      },
    });
  }

  onAddBalance(): void {
    this.router.navigate(['/balance/add']);
  }

  onRefresh(): void {
    this.loadBalances();
  }

  onDeleteBalance(id: number): void {
    this.showDeleteConfirm.set(id);
  }

  onConfirmDelete(id: number): void {
    this.deleting.set(id);
    this.showDeleteConfirm.set(null);
    this.error.set(null);

    this.balanceService.deleteBalance(id).subscribe({
      next: () => {
        // Remove the deleted balance from the list
        this.balances.update((balances) => balances.filter((b) => b.id !== id));
        this.deleting.set(null);
      },
      error: (err) => {
        this.error.set('Failed to delete balance');
        this.deleting.set(null);
        console.error('Error deleting balance:', err);
      },
    });
  }

  onCancelDelete(): void {
    this.showDeleteConfirm.set(null);
  }
}
