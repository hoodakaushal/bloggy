import LoginPage from "../page-objects/LoginPage";

const loginPage = new LoginPage();
Cypress.Commands.add('login', (username, password) => {
  loginPage.visitLoginPage();
  loginPage.typeUsername(username);
  loginPage.typePassword(password);
    cy.intercept('POST', '/api/auth/login').as('login');
    loginPage.clickLoginButton();
    cy.wait('@login').then((response) => {
      if (response.response.statusCode === 200) {
        cy.url().should('include', '/admin');
      } else {
        throw new Error('Login failed');
      }
    });
});

Cypress.Commands.add('resetAndSeed', () => {
  cy.exec('npm run reset && npm run seed', { failOnNonZeroExit: false });
});

