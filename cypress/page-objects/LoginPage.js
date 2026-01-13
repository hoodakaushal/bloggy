export default class LoginPage {
  visitLoginPage() {
    cy.visit('/login');
  }

  getUsernameInput() {
    return cy.get('input[type="text"], input[name="username"]');
  }

  getPasswordInput() {
    return cy.get('input[type="password"], input[name="password"]');
  }

  getLoginButton() {
    return cy.get('button[type="submit"], button:contains("LOGIN")');
  }

  getRegisterTab() {
    return cy.contains('REGISTER');
  }

  getErrorMessage() {
    return cy.contains('error', { matchCase: false });
  }

  typeUsername(username) {
    this.getUsernameInput().type(username);
  }

  typePassword(password) {
    this.getPasswordInput().type(password);
  }

  clickLoginButton() {
    this.getLoginButton().click();
  }
}

