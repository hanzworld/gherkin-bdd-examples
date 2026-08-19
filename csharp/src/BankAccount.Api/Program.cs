using BankAccount.Api.Domain;
using BankAccount.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IAccountRepository, InMemoryAccountRepository>();
builder.Services.AddSingleton<IAccountNotifier, ConsoleAccountNotifier>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors();

app.MapPost("/api/accounts", (OpenAccountRequest request, AccountService service) =>
{
    var account = service.Open(request.Owner, request.OpeningBalance);
    return Results.Created($"/api/accounts/{account.Id}", ToResponse(account));
});

app.MapGet("/api/accounts/{id:guid}", (Guid id, AccountService service) =>
{
    var account = service.Find(id);
    return account is null ? Results.NotFound() : Results.Ok(ToResponse(account));
});

app.MapPost("/api/accounts/{id:guid}/deposit", (Guid id, AmountRequest request, AccountService service) =>
{
    try
    {
        return Results.Ok(ToResponse(service.Deposit(id, request.Amount)));
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
    catch (ArgumentOutOfRangeException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

app.MapPost("/api/accounts/{id:guid}/withdraw", (Guid id, AmountRequest request, AccountService service) =>
{
    try
    {
        return Results.Ok(ToResponse(service.Withdraw(id, request.Amount)));
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
    catch (InsufficientFundsException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch (ArgumentOutOfRangeException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

app.Run();

static AccountResponse ToResponse(Account account) => new(account.Id, account.Owner, account.Balance);

public record OpenAccountRequest(string Owner, decimal OpeningBalance);
public record AmountRequest(decimal Amount);
public record AccountResponse(Guid Id, string Owner, decimal Balance);

// Exposes the generated Program class to BankAccount.IntegrationTests via WebApplicationFactory<Program>.
public partial class Program
{
}
