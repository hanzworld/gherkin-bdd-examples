using BankAccount.Api.Domain;

namespace BankAccount.Api.Services;

public sealed class ConsoleAccountNotifier : IAccountNotifier
{
    public void NotifyDeposit(Account account, decimal amount) =>
        Console.WriteLine($"[notify] {amount:C} deposited into {account.Id}, new balance {account.Balance:C}");

    public void NotifyWithdrawal(Account account, decimal amount) =>
        Console.WriteLine($"[notify] {amount:C} withdrawn from {account.Id}, new balance {account.Balance:C}");
}
