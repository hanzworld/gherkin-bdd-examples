import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface AccountResponse {
  id: string;
  owner: string;
  balance: number;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/accounts';

  open(owner: string, openingBalance: number): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.baseUrl, { owner, openingBalance });
  }

  deposit(id: string, amount: number): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.baseUrl}/${id}/deposit`, { amount });
  }

  withdraw(id: string, amount: number): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(`${this.baseUrl}/${id}/withdraw`, { amount });
  }
}
