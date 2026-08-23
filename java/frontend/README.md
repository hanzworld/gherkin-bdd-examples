# BankAccount frontend (Java)

Angular app that calls the Spring Boot `app`'s HTTP API. Part of the
[gherkin-bdd-examples](../../README.md) repo — see the top-level README for
how this fits alongside the backend, unit/integration tests, and E2E suite.

## Development server

```bash
npm install
ng serve
```

Open `http://localhost:4200/`. The app calls the API at `/api/...`, so run
`mvn spring-boot:run` (from `../backend`) alongside it (or proxy /api to
`http://localhost:8080`) if you want real responses instead of network
errors.

## Building

```bash
npm run build
```

Builds straight into `../backend/src/main/resources/static` (see
`angular.json`'s `outputPath`), which is what the Spring Boot app serves as
static files. That output directory is gitignored — regenerate it, don't
hand-edit it.

## Tests

```bash
npm test
```

Runs the Jest + `jest-cucumber` suite in `test/` against the Gherkin feature
in `test/features/account-view.feature`, driving the `App` component via
`TestBed` with `HttpClientTestingModule` standing in for the network. See the
top-level README's test-level table for how this fits alongside the Java
unit/integration/E2E tests.
