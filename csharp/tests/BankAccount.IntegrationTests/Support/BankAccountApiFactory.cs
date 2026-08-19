using BankAccount.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace BankAccount.IntegrationTests.Support;

/// <summary>
/// Boots the real app in-memory (real routing, real model binding, real domain
/// logic) but swaps IAccountNotifier for a Moq mock so tests can assert on
/// notification behaviour without wiring up real notification infrastructure.
/// </summary>
public sealed class BankAccountApiFactory : WebApplicationFactory<Program>
{
    public Mock<IAccountNotifier> NotifierMock { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IAccountNotifier>();
            services.AddSingleton(NotifierMock.Object);
        });
    }
}
