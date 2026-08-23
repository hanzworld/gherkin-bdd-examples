package com.example.bankaccount.integration.steps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.example.bankaccount.service.AccountNotifier;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

public class AccountApiSteps {

    @Autowired
    private MockMvc mockMvc;

    // The @MockitoBean declaration lives on CucumberSpringConfiguration -
    // see the comment there for why. This is a plain by-type autowire of
    // the (already-mocked) bean from the same context.
    @Autowired
    private AccountNotifier accountNotifier;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UUID accountId;
    private MvcResult lastResult;

    @Given("an account exists for {string} with a balance of {int}")
    public void anAccountExistsForWithABalanceOf(String owner, int balance) throws Exception {
        var body = objectMapper.writeValueAsString(Map.of("owner", owner, "openingBalance", balance));
        var result = mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        accountId = UUID.fromString(json.get("id").asText());
    }

    @When("I POST a deposit of {int} to the account")
    public void iPostADepositOfToTheAccount(int amount) throws Exception {
        lastResult = performAmountRequest("deposit", amount);
    }

    @When("I POST a withdrawal of {int} from the account")
    public void iPostAWithdrawalOfFromTheAccount(int amount) throws Exception {
        lastResult = performAmountRequest("withdraw", amount);
    }

    private MvcResult performAmountRequest(String action, int amount) throws Exception {
        var body = objectMapper.writeValueAsString(Map.of("amount", amount));
        return mockMvc.perform(post("/api/accounts/{id}/" + action, accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();
    }

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int statusCode) {
        assertThat(lastResult.getResponse().getStatus()).isEqualTo(statusCode);
    }

    @Then("the account balance in the response should be {int}")
    public void theAccountBalanceInTheResponseShouldBe(int expected) throws Exception {
        JsonNode json = objectMapper.readTree(lastResult.getResponse().getContentAsString());
        assertThat(json.get("balance").decimalValue()).isEqualByComparingTo(BigDecimal.valueOf(expected));
    }

    @Then("the account notifier should have been notified of the deposit")
    public void theAccountNotifierShouldHaveBeenNotifiedOfTheDeposit() {
        verify(accountNotifier).notifyDeposit(argThat(a -> a.getId().equals(accountId)), any());
    }

    @Then("the account notifier should have been notified of the withdrawal")
    public void theAccountNotifierShouldHaveBeenNotifiedOfTheWithdrawal() {
        verify(accountNotifier).notifyWithdrawal(argThat(a -> a.getId().equals(accountId)), any());
    }
}
