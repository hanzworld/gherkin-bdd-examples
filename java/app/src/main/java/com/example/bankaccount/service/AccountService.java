package com.example.bankaccount.service;

import com.example.bankaccount.domain.Account;
import com.example.bankaccount.repository.AccountRepository;
import java.math.BigDecimal;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final AccountRepository repository;
    private final AccountNotifier notifier;

    public AccountService(AccountRepository repository, AccountNotifier notifier) {
        this.repository = repository;
        this.notifier = notifier;
    }

    public Account open(String owner, BigDecimal openingBalance) {
        return repository.save(new Account(UUID.randomUUID(), owner, openingBalance));
    }

    public Account find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account " + id + " not found."));
    }

    public Account deposit(UUID id, BigDecimal amount) {
        Account account = find(id);
        account.deposit(amount);
        notifier.notifyDeposit(account, amount);
        return account;
    }

    public Account withdraw(UUID id, BigDecimal amount) {
        Account account = find(id);
        account.withdraw(amount);
        notifier.notifyWithdrawal(account, amount);
        return account;
    }
}
