using BankAccount.Api.Domain;

namespace BankAccount.Api.Services;

public sealed class AccountService
{
    private readonly IAccountRepository _repository;
    private readonly IAccountNotifier _notifier;

    public AccountService(IAccountRepository repository, IAccountNotifier notifier)
    {
        _repository = repository;
        _notifier = notifier;
    }

    public Account Open(string owner, decimal openingBalance) =>
        _repository.Add(new Account(Guid.NewGuid(), owner, openingBalance));

    public Account? Find(Guid id) => _repository.Find(id);

    public Account Deposit(Guid id, decimal amount)
    {
        var account = GetOrThrow(id);
        account.Deposit(amount);
        _notifier.NotifyDeposit(account, amount);
        return account;
    }

    public Account Withdraw(Guid id, decimal amount)
    {
        var account = GetOrThrow(id);
        account.Withdraw(amount);
        _notifier.NotifyWithdrawal(account, amount);
        return account;
    }

    private Account GetOrThrow(Guid id) =>
        _repository.Find(id) ?? throw new KeyNotFoundException($"Account {id} not found.");
}
