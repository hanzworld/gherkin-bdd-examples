import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AccountResponse, AccountService } from './account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly accountService = inject(AccountService);

  protected readonly accountOpen = signal(false);
  protected readonly accountId = signal<string | null>(null);
  protected readonly balance = signal(0);
  protected readonly error = signal('');

  openAccount(owner: string, openingBalance: string): void {
    this.error.set('');
    this.accountService.open(owner, Number(openingBalance)).subscribe({
      next: (account) => this.applyAccount(account),
      error: (err) => this.error.set(this.extractError(err, 'Could not open account.')),
    });
  }

  deposit(amount: string): void {
    this.transact('deposit', amount);
  }

  withdraw(amount: string): void {
    this.transact('withdraw', amount);
  }

  private transact(kind: 'deposit' | 'withdraw', amount: string): void {
    const id = this.accountId();
    if (!id) {
      return;
    }

    this.error.set('');
    const request$ =
      kind === 'deposit'
        ? this.accountService.deposit(id, Number(amount))
        : this.accountService.withdraw(id, Number(amount));

    request$.subscribe({
      next: (account) => this.applyAccount(account),
      error: (err) => this.error.set(this.extractError(err, `Could not ${kind}.`)),
    });
  }

  private applyAccount(account: AccountResponse): void {
    this.accountId.set(account.id);
    this.balance.set(account.balance);
    this.accountOpen.set(true);
  }

  private extractError(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { error?: string } | null;
      return body?.error ?? fallback;
    }
    return fallback;
  }
}
