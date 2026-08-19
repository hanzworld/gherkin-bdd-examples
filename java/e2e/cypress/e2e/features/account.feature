Feature: Bank account web UI
  As a bank customer
  I want to manage my account through the web app
  So that I can see my balance change in real time

  This feature drives the real running app (started with
  `mvn spring-boot:run`) through an actual browser: browser -> static UI ->
  HTTP API -> domain logic -> in-memory repository. Nothing here is mocked.

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
