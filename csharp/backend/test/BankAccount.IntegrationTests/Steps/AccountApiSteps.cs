using System.Net.Http.Json;
using BankAccount.Api.Domain;
using BankAccount.IntegrationTests.Support;
using Moq;
using Reqnroll;
using Xunit;

namespace BankAccount.IntegrationTests.Steps;

[Binding]
public sealed class AccountApiSteps : IDisposable
{
    private readonly BankAccountApiFactory _factory = new();
    private readonly HttpClient _client;
    private Guid _accountId;
    private HttpResponseMessage _lastResponse = null!;

    public AccountApiSteps()
    {
        _client = _factory.CreateClient();
    }

    [Given(@"an account exists for ""(.*)"" with a balance of (\d+)")]
    public async Task GivenAnAccountExistsForWithABalanceOf(string owner, decimal balance)
    {
        var response = await _client.PostAsJsonAsync("/api/accounts", new { owner, openingBalance = balance });
        response.EnsureSuccessStatusCode();
        var account = await response.Content.ReadFromJsonAsync<AccountResponse>();
        _accountId = account!.Id;
    }

    [When(@"I POST a deposit of (\d+) to the account")]
    public async Task WhenIPostADepositOfToTheAccount(decimal amount)
    {
        _lastResponse = await _client.PostAsJsonAsync($"/api/accounts/{_accountId}/deposit", new { amount });
    }

    [When(@"I POST a withdrawal of (\d+) from the account")]
    public async Task WhenIPostAWithdrawalOfFromTheAccount(decimal amount)
    {
        _lastResponse = await _client.PostAsJsonAsync($"/api/accounts/{_accountId}/withdraw", new { amount });
    }

    [Then(@"the response status should be (\d+)")]
    public void ThenTheResponseStatusShouldBe(int statusCode)
    {
        Assert.Equal(statusCode, (int)_lastResponse.StatusCode);
    }

    [Then(@"the account balance in the response should be (\d+)")]
    public async Task ThenTheAccountBalanceInTheResponseShouldBe(decimal expected)
    {
        var account = await _lastResponse.Content.ReadFromJsonAsync<AccountResponse>();
        Assert.Equal(expected, account!.Balance);
    }

    [Then(@"the account notifier should have been notified of the deposit")]
    public void ThenTheAccountNotifierShouldHaveBeenNotifiedOfTheDeposit()
    {
        _factory.NotifierMock.Verify(
            n => n.NotifyDeposit(It.Is<Account>(a => a.Id == _accountId), It.IsAny<decimal>()),
            Times.Once);
    }

    [Then(@"the account notifier should have been notified of the withdrawal")]
    public void ThenTheAccountNotifierShouldHaveBeenNotifiedOfTheWithdrawal()
    {
        _factory.NotifierMock.Verify(
            n => n.NotifyWithdrawal(It.Is<Account>(a => a.Id == _accountId), It.IsAny<decimal>()),
            Times.Once);
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }
}
