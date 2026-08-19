package com.example.bankaccount.service;

import com.example.bankaccount.domain.Account;
import java.math.BigDecimal;

/**
 * Stands in for a real notification channel (email, push, event bus). Kept as
 * its own interface specifically so integration tests can mock it with
 * Mockito instead of standing up real notification infrastructure.
 */
public interface AccountNotifier {

    void notifyDeposit(Account account, BigDecimal amount);

    void notifyWithdrawal(Account account, BigDecimal amount);
}
