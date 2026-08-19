using System.Collections.Concurrent;
using BankAccount.Api.Domain;

namespace BankAccount.Api.Services;

public sealed class InMemoryAccountRepository : IAccountRepository
{
    private readonly ConcurrentDictionary<Guid, Account> _accounts = new();

    public Account Add(Account account)
    {
        _accounts[account.Id] = account;
        return account;
    }

    public Account? Find(Guid id) => _accounts.GetValueOrDefault(id);
}
