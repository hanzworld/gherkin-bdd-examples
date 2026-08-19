# Gherkin BDD Examples — C# and Java

Same domain, same Gherkin scenarios, implemented twice (C# and Java) and tested at
three levels each. The point of the repo is to show *where* a Gherkin `.feature`
file plugs into different kinds of automated tests, not to build an elaborate app.

## The domain

A tiny **bank account** service: open with a starting balance, deposit, withdraw,
and reject withdrawals that would overdraw. It's implemented three times per
language, each exposing the same behaviour to a different kind of test:

- **Domain object** (`Account`) — plain class, no framework, no I/O.
- **HTTP API** — a thin web layer over the domain object, backed by an
  in-memory repository and an `AccountNotifier` collaborator (stands in for
  "send an email / publish an event" — the kind of thing you mock).
- **Static web UI** (`index.html` + `fetch`) — one page that calls the API,
  purely so Cypress has a real browser flow to drive instead of hitting JSON
  endpoints directly.

## Layout

```
gherkin-bdd-examples/
├── csharp/
│   ├── src/BankAccount.Api/            ASP.NET Core minimal API + static UI
│   └── tests/
│       ├── BankAccount.UnitTests/      xUnit + Reqnroll — tests Account directly
│       ├── BankAccount.IntegrationTests/ xUnit + Reqnroll + Moq + WebApplicationFactory
│       └── e2e/                        Cypress + cypress-cucumber-preprocessor
└── java/
    ├── app/                            Spring Boot app + static UI (Maven)
    │   └── src/test/java/.../unit/         JUnit 5 + Cucumber-JVM — tests Account directly
    │   └── src/test/java/.../integration/  JUnit 5 + Cucumber-JVM + @SpringBootTest + Mockito
    └── e2e/                            Cypress + cypress-cucumber-preprocessor
```

## How the three test types map to Gherkin

| Level | Framework | What it exercises | What's mocked |
|---|---|---|---|
| Unit | xUnit+Reqnroll / JUnit5+Cucumber-JVM | The `Account` domain class in isolation | Nothing — no I/O at all |
| Integration | xUnit+Reqnroll+Moq / JUnit5+Cucumber+Spring Boot Test+Mockito | The real HTTP layer, in-process (`WebApplicationFactory` / `@SpringBootTest` + `MockMvc`) | The `AccountNotifier` collaborator, so tests don't depend on email/messaging infra |
| E2E | Cypress + `@badeball/cypress-cucumber-preprocessor` | The real app process (`dotnet run` / `spring-boot:run`) through the actual browser UI | Nothing — full stack, real HTTP, real process |

All three levels for a given language reuse the *same scenario shape*
("deposit increases the balance", "withdrawing more than the balance is
refused", ...) — only the step definitions and what's plugged in underneath
change. That's deliberate: it's the same spec read top-to-bottom by a
non-technical stakeholder, automated at whatever altitude the test needs.

## Running things

### C#
```bash
cd csharp
dotnet test                    # unit + integration tests
dotnet run --project src/BankAccount.Api   # start the app on http://localhost:5080
cd tests/e2e && npm install && npx cypress open   # E2E, app must be running
```

> If the bundled Electron browser fails to launch headless in a locked-down
> environment (e.g. `cypress run` hangs waiting for the browser to connect),
> run with a real browser instead: `npx cypress run --browser chrome`.

### Java
```bash
cd java/app
mvn test -Dtest=RunCucumberUnitTest          # unit tests only
mvn test -Dtest=RunCucumberIntegrationTest   # integration tests only
mvn spring-boot:run                          # start the app on http://localhost:8080
cd ../e2e && npm install && npx cypress open # E2E, app must be running
```
