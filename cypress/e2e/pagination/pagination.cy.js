import HomePage from '../../page-objects/HomePage';
import testData from '../../fixtures/testData.json';

const homePage = new HomePage();


describe('Pagination', () => {
  beforeEach(() => {
    cy.resetAndSeed();
    homePage.visitHomePage();
  });

  it('should navigate through multiple pages and verify pagination exists along with the page state', () => {
    homePage.verifyPaginationExists();
    homePage.verifyActivePageNumber(1);
    homePage.goToNextPage();
    homePage.verifyBlogCardsExist();
    homePage.verifyPaginationExists();
    homePage.verifyActivePageNumber(2);
    homePage.goToPreviousPage();
    homePage.verifyPaginationExists();
    homePage.verifyActivePageNumber(1);
    homePage.verifyBlogCardsExist();
  });

  it('should navigate to specific page number and URL should contain the page number', () => {
    homePage.verifyPaginationExists();
    homePage.goToPage(2);
    homePage.verifyPageNumberInURL(2);
    homePage.verifyBlogCardsExist();
    homePage.verifyPaginationExists();
  });

  it('should navigate through multiple pages in admin dashboard and verify pagination exists along with the page state', () => {
    cy.login(testData.admin.username, testData.admin.password);
    homePage.visitHomePage();
    homePage.verifyPaginationExists();
    homePage.goToNextPage();
    homePage.verifyBlogCardsExist();
    homePage.verifyPaginationExists();
  });
});

