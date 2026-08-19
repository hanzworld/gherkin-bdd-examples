package com.example.bankaccount.domain;

import java.math.BigDecimal;
import java.util.UUID;

public final class Account {

    private final UUID id;
    private final String owner;
    private BigDecimal balance;

    public Account(UUID id, String owner, BigDecimal openingBalance) {
        if (owner == null || owner.isBlank()) {
            throw new IllegalArgumentException("Owner is required.");
        }
        if (openingBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Opening balance cannot be negative.");
        }

        this.id = id;
        this.owner = owner;
        this.balance = openingBalance;
    }

    public void deposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive.");
        }

        balance = balance.add(amount);
    }

    public void withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive.");
        }
        if (amount.compareTo(balance) > 0) {
            throw new InsufficientFundsException(id, balance, amount);
        }

        balance = balance.subtract(amount);
    }

    public UUID getId() {
        return id;
    }

    public String getOwner() {
        return owner;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
