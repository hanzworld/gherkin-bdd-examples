Feature: Bank account API
  As a client of the bank account service
  I want to deposit and withdraw over HTTP
  So that other systems can manage accounts through the API

  This feature boots the real ASP.NET Core app in-memory via
  WebApplicationFactory and talks to it over real HTTP. The AccountNotifier
  collaborator is replaced with a Moq mock so the test doesn't depend on real
  notification infrastructure, while still letting us assert it was called.

  Scenario: Depositing over the API updates the balance and notifies
    Given an account exists for "Grace Hopper" with a balance of 200
    When I POST a deposit of 75 to the account
    Then the response status should be 200
    And the account balance in the response should be 275
    And the account notifier should have been notified of the deposit

  Scenario: Withdrawing over the API updates the balance and notifies
    Given an account exists for "Grace Hopper" with a balance of 200
    When I POST a withdrawal of 50 from the account
    Then the response status should be 200
    And the account balance in the response should be 150
    And the account notifier should have been notified of the withdrawal

  Scenario: Overdrawing over the API is rejected with 400
    Given an account exists for "Grace Hopper" with a balance of 200
    When I POST a withdrawal of 500 from the account
    Then the response status should be 400
