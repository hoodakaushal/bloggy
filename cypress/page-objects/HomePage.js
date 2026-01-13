export default class HomePage {
  visitHomePage() {
    cy.visit('/');
  }

  getSearchInput() {
    return cy.get('input[type = "text"]');
  }

  getBlogCards() {
    return cy.get('.MuiPaper-elevation1');
  }

  getBlogCardByTitle(title) {
    return cy.contains('.MuiPaper-elevation1', title);
  }

  getReadStatusInBlogCardByTitle(title) {
    return this.getBlogCardByTitle(title)
      .find('.MuiChip-filledSuccess .MuiChip-label').contains('Read');
  }

  getCategoryFilter() {
    return cy.get('select[name="category"], [class*="category-filter"]');
  }

  getPageByNumber(pageNumber) {
    return cy.get('.MuiPaginationItem-circular').contains(pageNumber.toString()).scrollIntoView();
  }

  getNextPageButton() {
    return cy.get('[aria-label="Go to next page"]').scrollIntoView();
  }

  getPreviousPageButton() {
    return cy.get('[aria-label="Go to previous page"]').scrollIntoView();
  }

  getThemeToggle() {
    return cy.get('.MuiIconButton-colorInherit');
  }

  getReadMoreButtonByTitle(title) {
    return this.getBlogCardByTitle(title)
      .find('.MuiButton-textPrimary').contains('Read More');
  }

  searchHomePage(keyword) {
    this.getSearchInput().clear().type(keyword + '{enter}');
  }

  clickReadMoreButtonByTitle(title) {
    this.getReadMoreButtonByTitle(title)
      .should('be.visible')
      .click();
  }

  goToNextPage() {
    this.getNextPageButton().click();
  }

  goToPreviousPage() {
    this.getPreviousPageButton().click();
  }

  goToPage(pageNumber) {
    this.getPageByNumber(pageNumber).click();
  }

  toggleTheme() {
    this.getThemeToggle().click();
  }

  verifyBlogCardsExist() {
    this.getBlogCards().should('have.length.greaterThan', 0);
  }

  verifySearchResults(keyword) {
    this.getBlogCards().each(($card) => {
      cy.wrap($card).should('contain.text', keyword);
    });
  }

  verifyBlogReadByTitle(title) {
    this.getReadStatusInBlogCardByTitle(title).should('be.visible');
  }

  verifyDarkMode() {
    this.getThemeToggle().should('have.attr', 'title', 'Switch to light mode');
  }

  verifyLightMode() {
    this.getThemeToggle().should('have.attr', 'title', 'Switch to dark mode');
  }

  verifyPaginationExists() {
    this.getPageByNumber(1).should('exist');
    this.getNextPageButton().should('be.visible');
    this.getPreviousPageButton().should('be.visible');
  }

  verifyPageNumberInURL(pageNumber) {
    cy.url().should('include', `page=${pageNumber}`);
  }

  verifyActivePageNumber(pageNumber) {
    // Material-UI pagination marks active page with aria-current="true" or Mui-selected class
    cy.get('.MuiPaginationItem-circular')
      .contains(pageNumber.toString())
      .should(($el) => {
        const isActive = $el.attr('aria-current') === 'true' || $el.hasClass('Mui-selected');
        expect(isActive, `Page ${pageNumber} should be marked as active`).to.be.true;
      });
  }
}
