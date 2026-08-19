package com.example.bankaccount.repository;

import com.example.bankaccount.domain.Account;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository {

    Account save(Account account);

    Optional<Account> findById(UUID id);
}
