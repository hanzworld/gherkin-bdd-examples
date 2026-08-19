package com.example.bankaccount.web;

import com.example.bankaccount.service.AccountService;
import com.example.bankaccount.web.dto.AccountResponse;
import com.example.bankaccount.web.dto.AmountRequest;
import com.example.bankaccount.web.dto.OpenAccountRequest;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> open(@RequestBody OpenAccountRequest request) {
        var account = accountService.open(request.owner(), request.openingBalance());
        return ResponseEntity.created(URI.create("/api/accounts/" + account.getId()))
                .body(AccountResponse.from(account));
    }

    @GetMapping("/{id}")
    public AccountResponse find(@PathVariable UUID id) {
        return AccountResponse.from(accountService.find(id));
    }

    @PostMapping("/{id}/deposit")
    public AccountResponse deposit(@PathVariable UUID id, @RequestBody AmountRequest request) {
        return AccountResponse.from(accountService.deposit(id, request.amount()));
    }

    @PostMapping("/{id}/withdraw")
    public AccountResponse withdraw(@PathVariable UUID id, @RequestBody AmountRequest request) {
        return AccountResponse.from(accountService.withdraw(id, request.amount()));
    }
}
