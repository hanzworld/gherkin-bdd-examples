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
- **Web UI** (Angular) — a small Angular app that calls the API via
  `HttpClient`, purely so Cypress has a real browser flow to drive instead of
  hitting JSON endpoints directly, and so there's a component worth writing a
  frontend-level Gherkin test against.

## Layout

Both language folders share the exact same three top-level names —
`backend/`, `frontend/`, `e2e/` — so the same mental map works for either
one. Backend and frontend each keep their tests *inside* themselves, next to
the code under test (`backend/test/` or `backend/src/test/`, `frontend/test/`);
only E2E, which exercises backend and frontend together, gets its own
top-level folder instead of living inside either.

```
gherkin-bdd-examples/
├── csharp/
│   ├── backend/
│   │   ├── src/BankAccount.Api/          ASP.NET Core minimal API; wwwroot/ is `ng build` output (gitignored)
│   │   └── test/
│   │       ├── BankAccount.UnitTests/        xUnit + Reqnroll — tests Account directly
│   │       └── BankAccount.IntegrationTests/ xUnit + Reqnroll + Moq + WebApplicationFactory
│   ├── frontend/                         Angular app (calls the API)
│   │   ├── src/app/                      component + AccountService
│   │   └── test/                         Jest + jest-cucumber — TestBed, HttpClientTestingModule
│   └── e2e/                              Cypress + cypress-cucumber-preprocessor
└── java/
    ├── backend/                          Spring Boot app (Maven); src/main/resources/static/ is `ng build` output (gitignored)
    │   └── src/test/java/.../unit/           JUnit 5 + Cucumber-JVM — tests Account directly
    │   └── src/test/java/.../integration/    JUnit 5 + Cucumber-JVM + @SpringBootTest + Mockito
    ├── frontend/                         Angular app (calls the API) — same component as csharp/frontend
    │   ├── src/app/
    │   └── test/                         Jest + jest-cucumber — TestBed, HttpClientTestingModule
    └── e2e/                              Cypress + cypress-cucumber-preprocessor
```

## How the test types map to Gherkin

| Level | Framework | What it exercises | What's mocked |
|---|---|---|---|
| Unit | xUnit+Reqnroll / JUnit5+Cucumber-JVM | The `Account` domain class in isolation | Nothing — no I/O at all |
| Integration | xUnit+Reqnroll+Moq / JUnit5+Cucumber+Spring Boot Test+Mockito | The real HTTP layer, in-process (`WebApplicationFactory` / `@SpringBootTest` + `MockMvc`) | The `AccountNotifier` collaborator, so tests don't depend on email/messaging infra |
| Frontend | Jest + `jest-cucumber` | The Angular `App` component via `TestBed`, driving the DOM and asserting on rendered output | The network — `HttpClientTestingModule` stands in for the API |
| E2E | Cypress + `@badeball/cypress-cucumber-preprocessor` | The real app process (`dotnet run` / `spring-boot:run`) through the actual browser UI | Nothing — full stack, real HTTP, real process |

All levels for a given language reuse the *same scenario shape*
("deposit increases the balance", "withdrawing more than the balance is
refused", ...) — only the step definitions and what's plugged in underneath
change. That's deliberate: it's the same spec read top-to-bottom by a
non-technical stakeholder, automated at whatever altitude the test needs.

## Gherkin scenarios

The same use cases are implemented in both languages — that's the point of
the repo. At every level, the scenario titles and steps in the C# and Java
`.feature` files are word-for-word identical (only the prose under `Feature:`
differs, since it calls out framework-specific details like
`WebApplicationFactory` vs `@SpringBootTest`).

### Unit — `Account balance management`
`csharp/backend/test/BankAccount.UnitTests/Features/Account.feature` ·
`java/backend/src/test/resources/features/unit/account.feature`

- Depositing money increases the balance
- Withdrawing money within the balance decreases it
- Withdrawing more than the balance is refused
- Depositing a negative amount is refused

### Integration — `Bank account API`
`csharp/backend/test/BankAccount.IntegrationTests/Features/AccountApi.feature` ·
`java/backend/src/test/resources/features/integration/account_api.feature`

- Depositing over the API updates the balance and notifies
- Withdrawing over the API updates the balance and notifies
- Overdrawing over the API is rejected with 400

### Frontend — `Bank account view`
`csharp/frontend/test/features/account-view.feature` ·
`java/frontend/test/features/account-view.feature`

- Opening an account shows the starting balance
- Depositing money updates the balance shown
- Withdrawing more than the balance shows an error

### E2E — `Bank account web UI`
`csharp/e2e/cypress/e2e/features/account.feature` ·
`java/e2e/cypress/e2e/features/account.feature`

- Opening an account shows the starting balance
- Depositing money updates the balance on screen
- Withdrawing more than the balance shows an error
- Customer receives an email confirmation after opening an account `@manual`

## Manual tests

Some scenarios can't reasonably be automated - e.g. "the customer receives a
confirmation email" isn't worth standing up a real inbox for. Tag those
`@manual` (see the last scenario in each language's `e2e/features/account.feature`).
Every test runner in this repo is configured to skip `@manual` scenarios:

- Reqnroll turns tags into xUnit traits, so `dotnet test --filter "Category!=manual"` excludes them.
- The Cucumber-JVM suite classes (`RunCucumberUnitTest`, `RunCucumberIntegrationTest`) set `FILTER_TAGS_PROPERTY_NAME` to `not @manual`.
- Both Cypress configs default `env.tags` to `not @manual`.

`scripts/find-manual-tests.mjs` scans every `.feature` file for `@manual`
scenarios and writes a checklist (`node scripts/find-manual-tests.mjs [outDir]`).
The pipeline (`azure-pipelines.yml`) runs this after the automated stages; if
any manual scenarios are found, it publishes the checklist as a build
artifact and pauses on the `manual-testing` environment's approval gate
until someone runs them by hand and records `MT-001: PASS` / `MT-001: FAIL -
<notes>` per scenario in the approval comment. That comment is then
published as its own `manual-test-results` artifact alongside the automated
test result artifacts.

### Test reporting

Every level, in both languages, ends up in Azure DevOps's **Tests** tab for
the build, not just as artifacts:

| Run | Format | Published by |
|---|---|---|
| C# unit + integration | TRX | `PublishTestResults@2` in the `CSharp` stage |
| Java unit + integration | JUnit XML (Surefire) | `Maven@4`'s `publishJUnitResults` in the `Java` stage |
| C# frontend (Jest) | JUnit XML (`jest-junit`) | `PublishTestResults@2` in the `CSharp` stage |
| Java frontend (Jest) | JUnit XML (`jest-junit`) | `PublishTestResults@2` in the `Java` stage |
| C# E2E (Cypress) | JUnit XML | `PublishTestResults@2` in the `CSharp` stage |
| Java E2E (Cypress) | JUnit XML | `PublishTestResults@2` in the `Java` stage |
| Manual | JUnit XML | `PublishTestResults@2` in the `ManualApproval` stage |

Cypress doesn't produce JUnit XML on its own, so both `e2e` projects run it
through `cypress-multi-reporters` + `mocha-junit-reporter` (see
`cypress.config.js`) — `spec` still streams pass/fail to the console live,
while `mocha-junit-reporter` additionally writes `results/junit-*.xml` for
the pipeline to pick up.

For manual tests, `capture-manual-test-results.mjs` turns the parsed
`MT-001: PASS` / `MT-001: FAIL - <notes>` lines into a JUnit XML file too —
one `<testcase>` per `@manual` scenario, `PASS` scenarios clean, `FAIL`
scenarios carry the notes as the failure message. Critically, a scenario
that never got a matching line in the approval comment is reported as
**NOT RECORDED**, itself surfaced as a failing test — so an approver who
skips a scenario shows up as a red test in the Tests tab rather than the
scenario just quietly not existing anywhere.

### One-time pipeline setup

The `ManualApproval` stage gates on an Azure DevOps **Environment**, which
can't be created from YAML — a project admin has to set it up once, and this
step is easy to miss because the pipeline will otherwise just fail the first
time it tries to reach the stage:

1. **Project Settings → Environments → New environment**, name it exactly
   `manual-testing` (must match `environment:` in `azure-pipelines.yml`).
2. Open it → **Approvals and checks → Approvals** → add whoever is allowed
   to sign off on manual testing (a person or a group).
3. In the check's **Instructions to approvers** field, paste something like:
   > Open the `manual-test-checklist` artifact from this run, work through
   > each scenario, then enter one line per scenario in this approval's
   > comment box before approving: `MT-001: PASS` or
   > `MT-001: FAIL - <what went wrong>`.
4. The pipeline's build service account needs permission to read approvals
   via `$(System.AccessToken)` for the results-capture step — this is
   typically already the case for the default project Build Service
   identity, but if that step fails with an auth error, check the Build
   Service account's project permissions.

### Things to note / known limitation

Capturing the approver's typed comment relies on the Azure DevOps
**Approvals REST API** (`_apis/pipelines/approvals`), which is one of the
less-documented corners of the platform — it has **not** been verified
against a live Azure DevOps organization, only reasoned about from
documented behaviour. The `capture-manual-test-results.mjs` step is wrapped
in `continueOnError: true` for this reason: if the API shape doesn't match
what the script expects, it writes a fallback `manual-test-results.md`
saying so instead of failing the run, and the **Approvals panel on the
pipeline run itself remains the authoritative record** of who approved and
what they typed. Treat the automatically-captured artifact as a convenience,
not the source of truth, until you've confirmed it works against your own
organization — the query/parsing logic may need small adjustments (e.g. the
API version or filter parameters) the first time it runs for real.

## Running things

### C#
```bash
cd csharp/backend
dotnet test                    # unit + integration tests
cd ../frontend && npm install && npm test    # frontend unit tests (Jest)
npm run build                                # builds into ../backend/src/BankAccount.Api/wwwroot
cd ../backend && dotnet run --project src/BankAccount.Api   # start the app on http://localhost:5080
cd ../e2e && npm install && npx cypress open   # E2E, app must be running
```

> If the bundled Electron browser fails to launch headless in a locked-down
> environment (e.g. `cypress run` hangs waiting for the browser to connect),
> run with a real browser instead: `npx cypress run --browser chrome`.

### Java
```bash
cd java/backend
mvn test -Dtest=RunCucumberUnitTest          # unit tests only
mvn test -Dtest=RunCucumberIntegrationTest   # integration tests only
cd ../frontend && npm install && npm test    # frontend unit tests (Jest)
npm run build                                # builds into ../backend/src/main/resources/static
cd ../backend && mvn spring-boot:run          # start the app on http://localhost:8080
cd ../e2e && npm install && npx cypress open # E2E, app must be running
```
