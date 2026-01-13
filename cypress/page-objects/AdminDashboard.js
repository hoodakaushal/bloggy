export default class AdminDashboard {
  getNewBlogPostBtn() {
    // Use text-based selector - Cypress will retry until element is found
    // This is more reliable than CSS class selectors which can change
    return cy.contains('button', 'New Blog Post', { matchCase: false });
  }

  getBlogList() {
    return cy.get('[data-testid="blog-list"], .blog-list, article, [class*="blog"]');
  }

  getBlogCard(title) {
    return cy.contains(title).closest('article, [class*="card"], [class*="blog"]');
  }

  getDeleteButtonByTitle(blogTitle) {
    // Find the table row containing the title, then find the delete button in the actions cell
    return cy.contains('.MuiTableBody-root .MuiTableRow-root', blogTitle)
      .find('.MuiIconButton-colorError')
      .first();
  }

  getEditButton(blogTitle) {
    // Find the table row containing the title, then find the edit button in the actions cell
    return cy.contains('.MuiTableBody-root .MuiTableRow-root', blogTitle)
      .find('button[title="Edit"], .MuiIconButton-root')
      .eq(-2); // Second to last button (edit is before delete)
  }

  getConfirmDeleteButton() {
    return cy.get('.MuiButton-containedError').contains('Delete');
  }

  getCancelDeleteButtonInPopup() {
    return cy.get('.MuiButton-textPrimary').contains('Cancel');
  }

  clickOnNewBlogPostBtn() {
    cy.url().should('include', '/admin');
    this.getNewBlogPostBtn()
      .should('exist')
      .scrollIntoView()
      .should('be.visible')
      .should('not.be.disabled')
      .click();
  }

  deleteBlog(blogTitle) {
    cy.get('.MuiTableBody-root').should('be.visible');
    this.getDeleteButtonByTitle(blogTitle)
      .should('be.visible')
      .click();
    
    cy.contains('Delete Blog Post', { matchCase: false }).should('be.visible');
    
    this.getConfirmDeleteButton().click();
    
    cy.get('.MuiCircularProgress-root').should('not.exist');
  }
  
  cancelDeleteBlog(blogTitle) {
    cy.get('.MuiTableBody-root').should('be.visible');
    this.getDeleteButtonByTitle(blogTitle)
      .should('be.visible')
      .click();
    cy.contains('Delete Blog Post', { matchCase: false }).should('be.visible');
    this.getCancelDeleteButtonInPopup()
      .should('be.visible')
      .click();
    cy.contains('Delete Blog Post', { matchCase: false }).should('not.exist');
  }

  verifyBlogEditorPage() {
    cy.url().should('include', '/admin/blog/new');
    cy.contains('Create New Blog Post', { matchCase: false }).should('be.visible');
    cy.get('.MuiInputBase-root input').first().should('be.visible');
  }
}


