package com.example.bankaccount.web.dto;

import com.example.bankaccount.domain.Account;
import java.math.BigDecimal;
import java.util.UUID;

public record AccountResponse(UUID id, String owner, BigDecimal balance) {

    public static AccountResponse from(Account account) {
        return new AccountResponse(account.getId(), account.getOwner(), account.getBalance());
    }
}
