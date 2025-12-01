# Blog Application Test Suite

Comprehensive end-to-end test suite for the fullstack blog application using Playwright.

## Framework Choice: Playwright

### Why Playwright?

1. **Cross-Browser Support** - Tests run on Chromium, Firefox, and WebKit
2. **Auto-Wait** - Automatically waits for elements to be ready before performing actions
3. **Excellent TypeScript Support** - First-class TypeScript integration
4. **Powerful Selectors** - Multiple selector strategies with fallbacks
5. **Built-in Test Runner** - No need for additional test runners
6. **Rich Reporting** - HTML reports with screenshots and videos
7. **Network Interception** - Easy to mock and intercept network requests
8. **Already Configured** - Project already has Playwright setup

## Test Coverage

### 1. Blog Management Tests (`blog-management.spec.ts`)
**Admin Features:**
- ✅ Create and publish new blog posts
- ✅ Delete blog posts with confirmation dialog
- ✅ Handle draft and published status

**Key Features:**
- Admin authentication before tests
- Rich text editor interaction
- Confirmation dialog handling
- Post verification in blog list

### 2. Public Blog Viewing Tests (`public-viewing.spec.ts`)
**Public Features:**
- ✅ View list of published blogs
- ✅ Search for blogs by keyword
- ✅ View individual blog posts
- ✅ Theme preference persistence across sessions
- ✅ Read blogs visual marking across sessions
- ✅ Anonymous likes on posts
- ✅ Anonymous comments on posts

**Key Features:**
- LocalStorage persistence testing
- Browser context sharing for session tests
- Theme toggle and verification
- Read status tracking
- Interactive features (likes, comments)

### 3. Pagination Tests (`pagination.spec.ts`)
**Pagination Features:**
- ✅ Navigate using next/previous buttons
- ✅ Page state persists in URL
- ✅ Direct navigation via URL
- ✅ Page number display and navigation
- ✅ Disabled states on first/last pages
- ✅ Search/filter state across pagination

**Key Features:**
- URL parameter verification
- State persistence after refresh
- Edge case handling (first/last page)
- Integration with search functionality

## Setup Instructions

### Prerequisites
- Node.js >= 20.0.0
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Seed test data:**
   ```bash
   npm run seed
   ```

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test Suite
```bash
# Blog management tests
npx playwright test blog-management

# Public viewing tests
npx playwright test public-viewing

# Pagination tests
npx playwright test pagination
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Tests on Specific Browser
```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit
```

### Debug Tests
```bash
# Debug mode with Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test blog-management --debug
```

## View Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

The report includes:
- Test results summary
- Screenshots on failure
- Video recordings (on failure)
- Execution timeline
- Network logs

## Test Data Management

### Reset and Reseed Database
Between test runs, you may want to reset the database:
```bash
npm run reset && npm run seed
```

### Start Development Servers
Tests expect both frontend and backend to be running:
```bash
npm run dev
```

The Playwright config includes a `webServer` option that automatically starts the dev servers when running tests.

## Project Structure

```
tests/
├── helpers.ts                    # Shared utilities and helper functions
├── blog-management.spec.ts       # Admin blog management tests
├── public-viewing.spec.ts        # Public-facing feature tests
├── pagination.spec.ts            # Pagination and navigation tests
└── README.md                     # This file

playwright.config.cjs              # Playwright configuration
```

## Helper Functions

The `helpers.ts` file provides reusable utilities:

- **Authentication:**
  - `loginAsAdmin()` - Login with admin credentials
  - `logout()` - Logout current user

- **Blog Management:**
  - `generateBlogData()` - Generate test blog post data
  - `createBlogPost()` - Create blog via UI
  - `deleteBlogPost()` - Delete blog via UI
  - `searchBlogs()` - Search for blogs

- **Theme & Preferences:**
  - `toggleTheme()` - Toggle dark/light mode
  - `getCurrentTheme()` - Get theme from localStorage

- **Pagination:**
  - `navigateToPage()` - Go to specific page number
  - `getCurrentPageFromURL()` - Extract page number from URL
  - `clickNextPage()` / `clickPreviousPage()` - Navigation helpers

- **Read Status:**
  - `getReadPosts()` - Get read posts from localStorage
  - `isBlogMarkedAsRead()` - Check if blog has read indicator

## Configuration

Key configuration in `playwright.config.cjs`:

- **Base URL:** `http://localhost:5173`
- **Test Directory:** `./tests`
- **Parallel Execution:** Enabled
- **Retries:** 2 retries in CI, 0 locally
- **Reporter:** HTML report
- **Browsers:** Chromium, Firefox, WebKit
- **Auto-start servers:** Configured via `webServer`

## Best Practices Used

1. **Robust Selectors** - Multiple selector fallbacks for reliability
2. **Proper Waits** - Network idle and element visibility waits
3. **Test Isolation** - Each test is independent
4. **Screenshots** - Captured at key points for debugging
5. **Console Logging** - Helpful debug information
6. **Error Handling** - Graceful handling of missing elements
7. **Page Object Pattern** - Helper functions abstract common operations
8. **Data Generation** - Dynamic test data to avoid conflicts

## Assumptions & Notes

### Assumptions
1. **Admin Credentials:** Username `admin`, password `admin123` (as per assignment)
2. **Seeded Data:** Tests assume database has been seeded with `npm run seed`
3. **Port Numbers:** Frontend on 5173, backend on 3001
4. **Element Selectors:** Tests use semantic selectors (roles, labels) with fallbacks
5. **LocalStorage Keys:** Theme stored as `theme`, read posts as `readPosts`

### Notes
1. **Selector Flexibility:** Tests use multiple selector strategies to handle different UI implementations
2. **Conditional Tests:** Some tests skip if features aren't available (e.g., pagination without enough posts)
3. **Screenshot Directory:** Screenshots saved to `test-results/` directory
4. **Test Data:** Each test generates unique data using timestamps to avoid conflicts
5. **Network Delays:** Tests include appropriate waits for network operations

## Troubleshooting

### Tests Fail Due to Timeout
- Increase timeout in test: `await expect(element).toBeVisible({ timeout: 10000 })`
- Check if dev servers are running
- Verify database is seeded

### Element Not Found
- Tests use multiple selector fallbacks
- Check if UI structure matches expected selectors
- Run in headed mode to see what's happening: `npx playwright test --headed`

### Database State Issues
- Reset and reseed: `npm run reset && npm run seed`
- Ensure tests run in isolation

### Port Conflicts
- Check if ports 5173 and 3001 are available
- Update `playwright.config.cjs` if using different ports

## CI/CD Integration

The test suite is ready for CI/CD integration. Example GitHub Actions workflow:

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Seed database
        run: npm run seed
      - name: Run tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Execution Time

Approximate execution times:
- **Blog Management:** ~30-45 seconds
- **Public Viewing:** ~45-60 seconds
- **Pagination:** ~30-45 seconds
- **Total (all tests):** ~2-3 minutes

## Future Enhancements

Potential improvements:
1. API-level testing for faster execution
2. Visual regression testing
3. Performance testing
4. Accessibility testing
5. Mobile viewport testing
6. Network condition testing (slow 3G, offline)
7. WebSocket real-time comment testing

## Contact & Support

For questions or issues with the test suite:
- Review test output and screenshots in `test-results/`
- Check HTML report: `npx playwright show-report`
- Run in debug mode: `npx playwright test --debug`
- Review Playwright documentation: https://playwright.dev

---

**Test Suite Version:** 1.0.0  
**Last Updated:** 2025-11-25  
**Playwright Version:** ^1.37.0
