export default class BlogEditor {

  getTitleInput() {
   return cy.get('.MuiInputBase-root input').eq(0);
  }

  getContentEditor() {
   return cy.get('.ql-editor');
  }

  getExcerptInput() {
   return cy.get('.MuiInputBase-root textarea').eq(0);
  }

  getCategoryDropdown() {
    return cy.contains('label', 'Category')
      .closest('.MuiFormControl-root')
      .find('[role="combobox"], .MuiSelect-select, .MuiOutlinedInput-input')
      .first();
  }

  getTagsInput() {
    return cy.contains('label', 'Tags')
      .closest('.MuiFormControl-root')
      .find('[role="combobox"], .MuiSelect-select, .MuiOutlinedInput-input')
      .first();
  }

  getStatusBtn(status){
    return cy.get(`button[value="${status}"]`);
  }

  getCancelBtn(){
    return cy.get('.MuiBox-root .MuiButtonBase-root').contains('Cancel');
  }

  getPublishBtn() {
    return cy.get('.MuiBox-root .MuiButtonBase-root').contains('Publish Now');
  }

  getSaveBtn() {
    return cy.get('.MuiBox-root .MuiButtonBase-root').contains('Save');
  }

  fillTitle(title) {
    this.getTitleInput().should('be.visible').type(title);
  }

  fillContent(content) {
    this.getContentEditor().should('be.visible').type(content);
  }

  fillExcerpt(excerpt) {
    this.getExcerptInput().should('be.visible').type(excerpt);
  }

  selectCategory(category) {
    this.getCategoryDropdown()
      .should('be.visible')
      .click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.contains('[role="option"]', category, { matchCase: false }).click();
  }

  fillTags(tags) {
    this.getTagsInput()
      .should('be.visible')
      .click();
    cy.get('[role="listbox"]').should('be.visible');
    const tagArray = tags.split(',').map(tag => tag.trim());
    tagArray.forEach(tag => {
      cy.contains('[role="option"]', tag, { matchCase: false }).click();
    });
    cy.get('body').type('{esc}');
  }

  clickOnPublishBtn() {
    this.getPublishBtn().click();
  }

  clickOnSaveBtn() {
    this.getSaveBtn().click();
  }

  clickOnCancelBtn() {
    this.getCancelBtn().click();
  }

  createBlog(blogData) {
    this.fillTitle(blogData.title);
    this.fillContent(blogData.content);
    this.fillExcerpt(blogData.excerpt);
    this.selectCategory(blogData.category);
    this.fillTags(blogData.tags);
    this.clickOnPublishBtn();
  }

 
}

