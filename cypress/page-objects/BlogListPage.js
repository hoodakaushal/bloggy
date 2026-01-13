export default class BlogListPage {

  getBlogTitle(title) {
    return cy.get('.MuiTableBody-root .MuiTableRow-root')
      .find('.MuiTableCell-root')
      .first()
      .contains(title);
  }
  
  getLikeButton() {
    return cy.contains('button', 'Like', { matchCase: false }).or(cy.get('[aria-label*="like" i], [class*="like"]'));
  }

  getLikeCount() {
    return cy.get('[class*="like-count"], [class*="likes"]');
  }

  getCommentInput() {
    return cy.get('textarea[name="comment"], input[name="comment"], [placeholder*="comment" i]');
  }

  getCommentAuthorInput() {
    return cy.get('input[name="author"], input[name="name"], input[placeholder*="name" i]');
  }

  getSubmitCommentButton() {
    return cy.contains('button', 'Submit', { matchCase: false }).or(cy.contains('button', 'Post', { matchCase: false }));
  }

  getComments() {
    return cy.get('[class*="comment"], [data-testid="comment"]');
  }

  getViewsCount() {
    return cy.get('[class*="views"], [class*="view-count"]');
  }

  like() {
    this.getLikeButton().click();
  }

  addComment(authorName, commentText) {
    this.getCommentAuthorInput().type(authorName);
    this.getCommentInput().type(commentText);
    this.getSubmitCommentButton().click();
  }

  verifyBlogTitleExists(title) {
    this.getBlogTitle(title).should('exist');
  }
  verifyBlogTitleDoesNotExist(title) {
    this.getBlogTitle(title).should('not.exist');
  }
}

