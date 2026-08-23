Feature: Bank account view

  As an account holder using the web app
  I want the page to reflect what the API says
  So that I always see an accurate balance or error message

  This feature exercises the Angular App component and AccountService via
  TestBed, with HttpClientTestingModule standing in for the network - no
  browser, no real server. It's the frontend's own "no I/O" level: it
  verifies the component turns API responses into what's shown on screen and
  shapes outgoing requests correctly, independent of whether a real backend
  agrees.

  Scenario: Opening an account shows the starting balance
    Given the account view is loaded
    When the user opens an account for "Katherine Johnson" with an opening balance of 100 and the API confirms it
    Then the balance shown should be 100

  Scenario: Depositing money updates the balance shown
    Given an account is open with a balance of 100
    When the user deposits 50 and the API confirms a balance of 150
    Then the balance shown should be 150

  Scenario: Withdrawing more than the balance shows an error
    Given an account is open with a balance of 100
    When the user withdraws 500 and the API rejects it with "Insufficient funds"
    Then an error containing "insufficient funds" should be shown
