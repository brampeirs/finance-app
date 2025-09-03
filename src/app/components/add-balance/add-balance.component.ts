import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../../services/balance.service';
import { CreateBalanceRequest } from '../../models/balance.model';

@Component({
  selector: 'app-add-balance',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-balance.component.html',
  styleUrl: './add-balance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBalanceComponent {
  private readonly fb = inject(FormBuilder);
  private readonly balanceService = inject(BalanceService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly balanceForm: FormGroup = this.fb.group({
    date: ['', [Validators.required]],
    balance: ['', [Validators.required, Validators.min(0)]],
  });

  protected onSubmit(): void {
    if (this.balanceForm.valid && !this.submitting()) {
      this.submitting.set(true);
      this.error.set(null);

      const formValue = this.balanceForm.value;
      const createRequest: CreateBalanceRequest = {
        id: this.generateNumericId(),
        date: formValue.date,
        balance: parseFloat(formValue.balance),
      };

      this.balanceService.createBalance(createRequest).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/balances']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set('Failed to create balance. Please try again.');
          console.error('Error creating balance:', err);
        },
      });
    }
  }

  protected onCancel(): void {
    this.router.navigate(['/balances']);
  }

  private generateNumericId(): number {
    // Generate a random number between 1000 and 999999
    // In a real app, this would typically be handled by the backend
    return Math.floor(Math.random() * (999999 - 1000 + 1)) + 1000;
  }

  protected getFieldError(fieldName: string): string | null {
    const field = this.balanceForm.get(fieldName);
    if (field?.invalid && (field?.dirty || field?.touched)) {
      if (field.errors?.['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors?.['min']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must be greater than or equal to 0`;
      }
    }
    return null;
  }
}
