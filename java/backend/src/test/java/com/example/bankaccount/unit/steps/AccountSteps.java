package com.example.bankaccount.unit.steps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import com.example.bankaccount.domain.Account;
import com.example.bankaccount.domain.InsufficientFundsException;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.math.BigDecimal;
import java.util.UUID;

public class AccountSteps {

    private Account account;
    private Throwable caughtException;

    @Given("an account for {string} with a balance of {int}")
    public void anAccountForWithABalanceOf(String owner, int balance) {
        account = new Account(UUID.randomUUID(), owner, BigDecimal.valueOf(balance));
    }

    @When("I deposit {int}")
    public void iDeposit(int amount) {
        account.deposit(BigDecimal.valueOf(amount));
    }

    @When("I withdraw {int}")
    public void iWithdraw(int amount) {
        account.withdraw(BigDecimal.valueOf(amount));
    }

    @When("I try to withdraw {int}")
    public void iTryToWithdraw(int amount) {
        caughtException = catchThrowable(() -> account.withdraw(BigDecimal.valueOf(amount)));
    }

    @When("I try to deposit {int}")
    public void iTryToDeposit(int amount) {
        caughtException = catchThrowable(() -> account.deposit(BigDecimal.valueOf(amount)));
    }

    @Then("the balance should be {int}")
    public void theBalanceShouldBe(int expected) {
        assertThat(account.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(expected));
    }

    @Then("the withdrawal should be refused with an insufficient funds error")
    public void theWithdrawalShouldBeRefusedWithAnInsufficientFundsError() {
        assertThat(caughtException).isInstanceOf(InsufficientFundsException.class);
    }

    @Then("the deposit should be refused as invalid")
    public void theDepositShouldBeRefusedAsInvalid() {
        assertThat(caughtException).isInstanceOf(IllegalArgumentException.class);
    }
}
