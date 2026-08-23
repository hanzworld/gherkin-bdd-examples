package com.example.bankaccount.service;

import com.example.bankaccount.domain.Account;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class ConsoleAccountNotifier implements AccountNotifier {

    @Override
    public void notifyDeposit(Account account, BigDecimal amount) {
        System.out.printf("[notify] %s deposited into %s, new balance %s%n", amount, account.getId(), account.getBalance());
    }

    @Override
    public void notifyWithdrawal(Account account, BigDecimal amount) {
        System.out.printf("[notify] %s withdrawn from %s, new balance %s%n", amount, account.getId(), account.getBalance());
    }
}
