package com.example.bankaccount.domain;

import java.math.BigDecimal;
import java.util.UUID;

public final class InsufficientFundsException extends RuntimeException {

    private final UUID accountId;
    private final BigDecimal balance;
    private final BigDecimal requestedAmount;

    public InsufficientFundsException(UUID accountId, BigDecimal balance, BigDecimal requestedAmount) {
        super("Account %s has insufficient funds: balance %s, requested %s.".formatted(accountId, balance, requestedAmount));
        this.accountId = accountId;
        this.balance = balance;
        this.requestedAmount = requestedAmount;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }
}
