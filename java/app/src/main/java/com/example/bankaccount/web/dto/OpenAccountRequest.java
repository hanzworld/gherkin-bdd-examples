package com.example.bankaccount.web.dto;

import java.math.BigDecimal;

public record OpenAccountRequest(String owner, BigDecimal openingBalance) {
}
