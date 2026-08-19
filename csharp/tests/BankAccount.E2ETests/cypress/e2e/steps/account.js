import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the bank account page', () => {
  cy.visit('/');
});

When('I open an account for {string} with an opening balance of {int}', (owner, openingBalance) => {
  cy.get('#owner').clear().type(owner);
  cy.get('#opening-balance').clear().type(String(openingBalance));
  cy.get('#open-account').click();
  cy.get('#balance-panel').should('be.visible');
});

When('I deposit {int}', (amount) => {
  cy.get('#deposit-amount').clear().type(String(amount));
  cy.get('#deposit').click();
});

When('I withdraw {int}', (amount) => {
  cy.get('#withdraw-amount').clear().type(String(amount));
  cy.get('#withdraw').click();
});

Then('I should see a balance of {int}', (balance) => {
  cy.get('#balance').should('have.text', String(balance));
});

Then('I should see an error containing {string}', (message) => {
  cy.get('#error').invoke('text').should('match', new RegExp(message, 'i'));
});
