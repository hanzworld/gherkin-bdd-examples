using BankAccount.Api.Domain;

namespace BankAccount.Api.Services;

public interface IAccountRepository
{
    Account Add(Account account);

    Account? Find(Guid id);
}
