import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import path from 'node:path';
import { App } from '../../src/app/app';

const feature = loadFeature(path.join(__dirname, '../features/account-view.feature'));

function setValue(fixture: ComponentFixture<App>, id: string, value: string): void {
  const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(`#${id}`);
  if (!input) {
    throw new Error(`No element with id "${id}"`);
  }
  input.value = value;
}

function click(fixture: ComponentFixture<App>, id: string): void {
  const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(`#${id}`);
  if (!button) {
    throw new Error(`No element with id "${id}"`);
  }
  button.click();
}

function textOf(fixture: ComponentFixture<App>, id: string): string {
  return (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)?.textContent?.trim() ?? '';
}

defineFeature(feature, (test) => {
  let fixture: ComponentFixture<App>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(App);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  test('Opening an account shows the starting balance', ({ given, when, then }) => {
    given('the account view is loaded', () => {
      // TestBed setup in beforeEach already loads the view.
    });

    when(
      /^the user opens an account for "(.*)" with an opening balance of (\d+) and the API confirms it$/,
      (owner: string, openingBalance: string) => {
        setValue(fixture, 'owner', owner);
        setValue(fixture, 'opening-balance', openingBalance);
        click(fixture, 'open-account');

        const req = httpMock.expectOne('/api/accounts');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ owner, openingBalance: Number(openingBalance) });
        req.flush({ id: 'acc-1', owner, balance: Number(openingBalance) });
        fixture.detectChanges();
      },
    );

    then(/^the balance shown should be (\d+)$/, (balance: string) => {
      expect(textOf(fixture, 'balance')).toBe(balance);
    });
  });

  test('Depositing money updates the balance shown', ({ given, when, then }) => {
    given(/^an account is open with a balance of (\d+)$/, (balance: string) => {
      setValue(fixture, 'owner', 'Ada Lovelace');
      setValue(fixture, 'opening-balance', balance);
      click(fixture, 'open-account');
      httpMock.expectOne('/api/accounts').flush({ id: 'acc-1', owner: 'Ada Lovelace', balance: Number(balance) });
      fixture.detectChanges();
    });

    when(/^the user deposits (\d+) and the API confirms a balance of (\d+)$/, (amount: string, newBalance: string) => {
      setValue(fixture, 'deposit-amount', amount);
      click(fixture, 'deposit');

      const req = httpMock.expectOne('/api/accounts/acc-1/deposit');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ amount: Number(amount) });
      req.flush({ id: 'acc-1', owner: 'Ada Lovelace', balance: Number(newBalance) });
      fixture.detectChanges();
    });

    then(/^the balance shown should be (\d+)$/, (balance: string) => {
      expect(textOf(fixture, 'balance')).toBe(balance);
    });
  });

  test('Withdrawing more than the balance shows an error', ({ given, when, then }) => {
    given(/^an account is open with a balance of (\d+)$/, (balance: string) => {
      setValue(fixture, 'owner', 'Ada Lovelace');
      setValue(fixture, 'opening-balance', balance);
      click(fixture, 'open-account');
      httpMock.expectOne('/api/accounts').flush({ id: 'acc-1', owner: 'Ada Lovelace', balance: Number(balance) });
      fixture.detectChanges();
    });

    when(/^the user withdraws (\d+) and the API rejects it with "(.*)"$/, (amount: string, errorMessage: string) => {
      setValue(fixture, 'withdraw-amount', amount);
      click(fixture, 'withdraw');

      const req = httpMock.expectOne('/api/accounts/acc-1/withdraw');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ amount: Number(amount) });
      req.flush({ error: errorMessage }, { status: 400, statusText: 'Bad Request' });
      fixture.detectChanges();
    });

    then(/^an error containing "(.*)" should be shown$/, (fragment: string) => {
      expect(textOf(fixture, 'error').toLowerCase()).toContain(fragment.toLowerCase());
    });
  });
});
