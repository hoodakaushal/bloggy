import LoginPage from '../../page-objects/LoginPage';
import AdminDashboard from '../../page-objects/AdminDashboard';
import BlogEditor from '../../page-objects/BlogEditor';
import testData from '../../fixtures/testData.json';
import BlogListPage from '../../page-objects/BlogListPage';


const adminDashboard = new AdminDashboard();
const blogEditor = new BlogEditor();
const blogListPage = new BlogListPage();
describe('Blog Management', () => {
  beforeEach(() => {
    cy.resetAndSeed();
    cy.login(testData.admin.username, testData.admin.password);
  });

  it('should create a new blog post and publish it', () => {
    adminDashboard.clickOnNewBlogPostBtn();
    adminDashboard.verifyBlogEditorPage();
    blogEditor.createBlog({
      ...testData.blog
    });
    blogListPage.verifyBlogTitleExists(testData.blog.title);
  });

  it('should delete a blog post with confirmation', () => {
    adminDashboard.clickOnNewBlogPostBtn();
    adminDashboard.verifyBlogEditorPage();
    blogEditor.createBlog({
      ...testData.blog
    });
    blogListPage.verifyBlogTitleExists(testData.blog.title);
    adminDashboard.deleteBlog(testData.blog.title);
    blogListPage.verifyBlogTitleDoesNotExist(testData.blog.title);
  });

  it('should cancel blog post deletion', () => {
    adminDashboard.clickOnNewBlogPostBtn();
    adminDashboard.verifyBlogEditorPage();
    blogEditor.createBlog({
      ...testData.blog
    });
    blogListPage.verifyBlogTitleExists(testData.blog.title);
    adminDashboard.cancelDeleteBlog(testData.blog.title);
    blogListPage.verifyBlogTitleExists(testData.blog.title);
  });
});

