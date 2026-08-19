using BankAccount.Api.Domain;

namespace BankAccount.Api.Services;

/// <summary>
/// Stands in for a real notification channel (email, push, event bus). Kept as its
/// own interface specifically so integration tests can mock it with Moq instead of
/// standing up real notification infrastructure.
/// </summary>
public interface IAccountNotifier
{
    void NotifyDeposit(Account account, decimal amount);

    void NotifyWithdrawal(Account account, decimal amount);
}
