namespace BankAccount.Api.Domain;

public sealed class Account
{
    public Guid Id { get; }
    public string Owner { get; }
    public decimal Balance { get; private set; }

    public Account(Guid id, string owner, decimal openingBalance)
    {
        if (string.IsNullOrWhiteSpace(owner))
        {
            throw new ArgumentException("Owner is required.", nameof(owner));
        }

        if (openingBalance < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(openingBalance), "Opening balance cannot be negative.");
        }

        Id = id;
        Owner = owner;
        Balance = openingBalance;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Deposit amount must be positive.");
        }

        Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Withdrawal amount must be positive.");
        }

        if (amount > Balance)
        {
            throw new InsufficientFundsException(Id, Balance, amount);
        }

        Balance -= amount;
    }
}
