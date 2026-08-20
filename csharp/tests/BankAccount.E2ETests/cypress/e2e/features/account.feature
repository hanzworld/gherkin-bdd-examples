Feature: Bank account web UI
  As a bank customer
  I want to manage my account through the web app
  So that I can see my balance change in real time

  This feature drives the real running app (started with `dotnet run`)
  through an actual browser: browser -> static UI -> HTTP API -> domain
  logic -> in-memory repository. Nothing here is mocked.

  Scenario: Opening an account shows the starting balance
    Given I am on the bank account page
    When I open an account for "Katherine Johnson" with an opening balance of 100
    Then I should see a balance of 100

  Scenario: Depositing money updates the balance on screen
    Given I am on the bank account page
    And I open an account for "Katherine Johnson" with an opening balance of 100
    When I deposit 50
    Then I should see a balance of 150

  Scenario: Withdrawing more than the balance shows an error
    Given I am on the bank account page
    And I open an account for "Katherine Johnson" with an opening balance of 100
    When I withdraw 500
    Then I should see an error containing "insufficient funds"

  # AccountNotifier only ever gets a mock in the integration suite (see
  # BankAccount.IntegrationTests) - nothing in this stack actually sends an
  # email, and standing up a real inbox for Cypress to poll isn't worth it.
  # A human has to open Katherine's inbox and check.
  @manual
  Scenario: Customer receives an email confirmation after opening an account
    Given I am on the bank account page
    When I open an account for "Katherine Johnson" with an opening balance of 100
    Then a confirmation email should arrive in the customer's inbox within 5 minutes
