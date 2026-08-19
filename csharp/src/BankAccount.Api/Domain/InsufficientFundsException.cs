namespace BankAccount.Api.Domain;

public sealed class InsufficientFundsException : Exception
{
    public Guid AccountId { get; }
    public decimal Balance { get; }
    public decimal RequestedAmount { get; }

    public InsufficientFundsException(Guid accountId, decimal balance, decimal requestedAmount)
        : base($"Account {accountId} has insufficient funds: balance {balance}, requested {requestedAmount}.")
    {
        AccountId = accountId;
        Balance = balance;
        RequestedAmount = requestedAmount;
    }
}
