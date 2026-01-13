import HomePage from '../../page-objects/HomePage';
// import BlogViewPage from '../../page-objects/BlogViewPage';
import testData from '../../fixtures/testData.json';

const homePage = new HomePage();
// const blogViewPage = new BlogViewPage();

describe('Public Blog Viewing', () => {
  beforeEach(() => {
    // Reset and seed database
    cy.resetAndSeed();
    homePage.visitHomePage();
  });

  it('should search for blogs by keyword', () => {
    homePage.searchHomePage(testData.search.keyword);
    homePage.verifyBlogCardsExist();
    homePage.verifySearchResults(testData.search.keyword);
  });

  it('should view a blog post and verify read status persists across sessions', () => {
    homePage.searchHomePage(testData.blogToView.title);
    homePage.clickReadMoreButtonByTitle(testData.blogToView.title);
    homePage.visitHomePage();
    homePage.verifyBlogCardsExist();
    homePage.verifyBlogReadByTitle(testData.blogToView.title);
    cy.reload();
    homePage.verifyBlogReadByTitle(testData.blogToView.title);
  });

  it('should persist theme preference across sessions', () => {
    homePage.verifyLightMode();
    homePage.toggleTheme();
    homePage.verifyDarkMode();
    cy.reload();
    homePage.verifyDarkMode();
    homePage.toggleTheme();
    homePage.verifyLightMode();
  });
});

