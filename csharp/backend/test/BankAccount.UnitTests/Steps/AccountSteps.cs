using BankAccount.Api.Domain;
using Reqnroll;
using Xunit;

namespace BankAccount.UnitTests.Steps;

[Binding]
public sealed class AccountSteps
{
    private Account _account = null!;
    private Exception? _caughtException;

    [Given(@"an account for ""(.*)"" with a balance of (\d+)")]
    public void GivenAnAccountForWithABalanceOf(string owner, decimal balance)
    {
        _account = new Account(Guid.NewGuid(), owner, balance);
    }

    [When(@"I deposit (\d+)")]
    public void WhenIDeposit(decimal amount)
    {
        _account.Deposit(amount);
    }

    [When(@"I withdraw (\d+)")]
    public void WhenIWithdraw(decimal amount)
    {
        _account.Withdraw(amount);
    }

    [When(@"I try to withdraw (\d+)")]
    public void WhenITryToWithdraw(decimal amount)
    {
        _caughtException = Record.Exception(() => _account.Withdraw(amount));
    }

    [When(@"I try to deposit (-?\d+)")]
    public void WhenITryToDeposit(decimal amount)
    {
        _caughtException = Record.Exception(() => _account.Deposit(amount));
    }

    [Then(@"the balance should be (\d+)")]
    public void ThenTheBalanceShouldBe(decimal expected)
    {
        Assert.Equal(expected, _account.Balance);
    }

    [Then(@"the withdrawal should be refused with an insufficient funds error")]
    public void ThenTheWithdrawalShouldBeRefusedWithAnInsufficientFundsError()
    {
        Assert.IsType<InsufficientFundsException>(_caughtException);
    }

    [Then(@"the deposit should be refused as invalid")]
    public void ThenTheDepositShouldBeRefusedAsInvalid()
    {
        Assert.IsType<ArgumentOutOfRangeException>(_caughtException);
    }
}
