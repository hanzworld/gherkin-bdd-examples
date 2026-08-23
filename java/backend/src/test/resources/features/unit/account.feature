Feature: Account balance management
  As an account holder
  I want to deposit and withdraw money
  So that my balance always reflects my transactions

  This feature exercises the Account domain object directly - no Spring
  context, no HTTP, no database. It's the fastest, narrowest level of test.

  Scenario: Depositing money increases the balance
    Given an account for "Ada Lovelace" with a balance of 100
    When I deposit 50
    Then the balance should be 150

  Scenario: Withdrawing money within the balance decreases it
    Given an account for "Ada Lovelace" with a balance of 100
    When I withdraw 40
    Then the balance should be 60

  Scenario: Withdrawing more than the balance is refused
    Given an account for "Ada Lovelace" with a balance of 100
    When I try to withdraw 150
    Then the withdrawal should be refused with an insufficient funds error
    And the balance should be 100

  Scenario: Depositing a negative amount is refused
    Given an account for "Ada Lovelace" with a balance of 100
    When I try to deposit -10
    Then the deposit should be refused as invalid
    And the balance should be 100
