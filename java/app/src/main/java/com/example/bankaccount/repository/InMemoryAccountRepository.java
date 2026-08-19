package com.example.bankaccount.repository;

import com.example.bankaccount.domain.Account;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryAccountRepository implements AccountRepository {

    private final Map<UUID, Account> accounts = new ConcurrentHashMap<>();

    @Override
    public Account save(Account account) {
        accounts.put(account.getId(), account);
        return account;
    }

    @Override
    public Optional<Account> findById(UUID id) {
        return Optional.ofNullable(accounts.get(id));
    }
}
