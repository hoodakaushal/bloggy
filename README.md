# Table of Contents

## Walkthrough Video
[Click here to download walkthrough video](./walkthrough_video.mov)

1. [Automation Framework Choice: Playwright](#automation-framework-choice-playwright)
   - [Overview](#overview)
   - [Why Playwright](#why-playwright)
   - [Pros of Using Playwright](#pros-of-using-playwright)
   - [Why Playwright Is Better Than Cypress](#why-playwright-is-better-than-cypress)
   - [Why Playwright Is Better Than Selenium](#why-playwright-is-better-than-selenium)
   - [Conclusion](#conclusion)
2. [Local Installation & Setup Guide](#local-installation--setup-guide)
   - [Install Node.js (v18)](#install-nodejs-v18)
   - [Install Project Dependencies](#install-project-dependencies)
   - [Install Playwright Browsers](#install-playwright-browsers)
   - [Start Backend & Frontend](#start-backend--frontend)
   - [Wait for Frontend to Be Ready](#wait-for-frontend-to-be-ready)
   - [Install Playwright Test Dependencies](#install-playwright-test-dependencies)
   - [Run Playwright for All Tests (Excluding Genuine Bugs)](#run-playwright-for-all-tests-excluding-genuine-bugs)
   - [Run Playwright for Bugs in App (We expect these to fail)](#run-playwright-for-bugs-in-app-we-expect-these-to-fail)
   - [FAQs](#faqs)
3. [Test Coverage Summary](#test-coverage-summary)
   - [Overview](#overview-1)
   - [Coverage Breakdown](#coverage-breakdown)
     - [Admin User – Blog Management (UI)](#admin-user--blog-management-ui)
     - [Authentication & Authorization](#authentication--authorization)
     - [API Testing](#api-testing)
     - [Public & Admin Shared User Flows (UI)](#public--admin-shared-user-flows-ui)
     - [User Registration (UI)](#user-registration-ui)
   - [Test Coverage Summary (High Level)](#test-coverage-summary-high-level)
   - [Identified Gaps / Future Enhancements](#identified-gaps--future-enhancements)
   - [Additional Test Scenarios (Not Implemented Due to Time Constraints)](#additional-test-scenarios-not-implemented-due-to-time-constraints)
     - [Blog Media Handling](#blog-media-handling)
     - [Blog Draft Management Edge Cases](#blog-draft-management-edge-cases)
     - [Security & Authorization](#security--authorization)
     - [Blog Publish/Unpublish Workflow](#blog-publishunpublish-workflow)
     - [Cross-Browser & Device Coverage](#cross-browser--device-coverage)
     - [Negative & Edge UI Scenarios](#negative--edge-ui-scenarios)
     - [Empty States/Validations Across Apps](#empty-statesvalidations-across-apps)
   - [Note](#note)
4. [Possible Optimizations & Improvements](#possible-optimizations--improvements)
   - [Test Execution Performance](#test-execution-performance)
   - [Test Stability & Flakiness Reduction](#test-stability--flakiness-reduction)
   - [Test Data Management](#test-data-management)
   - [Framework & Code Structure](#framework--code-structure)
   - [CI/CD & Reporting](#cicd--reporting)
   - [Summary](#summary)
5. [CI/CD Setup with GitHub Actions](#cicd-setup-with-github-actions)
   - [Workflow Overview](#workflow-overview)
     - [Job 1: Playwright Tests for Bloggy](#job-1-playwright-tests-for-bloggy)
     - [Job 2: Bugs in App via Playwright](#job-2-bugs-in-app-via-playwright)
   - [Key Notes](#key-notes)
6. [Test Artifacts & Reports](#test-artifacts--reports)
7. [Assumptions & Notes](#assumptions--notes)
   - [Environment Assumptions](#environment-assumptions)
   - [Test Assumptions](#test-assumptions)
   - [CI/CD Assumptions](#cicd-assumptions)
   - [Notes for Developers & Testers](#notes-for-developers--testers)
   - [General Assumption](#general-assumption)


# Automation Framework Choice: Playwright

## Overview

For this project, I chose **Playwright** as the test automation framework. The decision was based on its modern architecture, strong reliability, and excellent support for end-to-end testing of web applications.

---

## Why Playwright

Playwright provides a robust solution for testing modern web applications by offering cross-browser support, fast execution, and built-in mechanisms to reduce flaky tests. It fits well for both **local development** and **CI/CD pipelines**, making it a practical choice for scalable automation.

---

## Pros of Using Playwright

* **Cross-browser support by default**
  Easily test Chromium, Firefox, and WebKit using a single test suite.

* **Auto-waiting and smart assertions**
  Reduces the need for manual waits and minimizes flaky test failures.

* **Fast execution**
  Parallel test execution and efficient browser control lead to quicker feedback.

* **Excellent debugging capabilities**
  Includes Playwright Inspector, trace viewer, screenshots, and video recording.

* **Strong TypeScript support**
  Improves code quality, maintainability, and developer experience.

* **Supports both UI and API testing**
  Enables end-to-end workflows combining backend setup with frontend validation.

---

## Why Playwright Is Better Than Cypress

- **True cross-browser support**  
  Supports Chromium, Firefox, and WebKit (Safari) out of the box.

- **Handles multiple tabs and windows**  
  Native support for multi-tab and multi-window scenarios.

- **Built-in parallel execution**  
  Runs tests in parallel by default without extra services or setup.

- **More realistic end-to-end testing**  
  Does not inject runtime code into the browser, closer to real user behavior.

- **Stronger CI and debugging tooling**  
  Built-in tracing, screenshots, videos, retries, and HTML reports.


## Why Playwright Is Better Than Selenium

- **Faster and more reliable execution**  
  Built-in auto-waiting removes the need for explicit waits and reduces flakiness.

- **Modern architecture**  
  Direct browser control without WebDriver leads to more stable tests.

- **Built-in tooling out of the box**  
  Tracing, screenshots, videos, and HTML reports without extra libraries.

- **Easy setup and configuration**  
  Minimal boilerplate compared to Selenium’s driver and framework setup.

- **First-class support for modern web apps**  
  Better handling of SPAs, network requests, iframes, and async behavior.


## Conclusion

Playwright offers a strong balance of **speed, stability, and developer productivity**. Despite minor limitations, it is an excellent choice for automating modern web applications and building reliable, maintainable test suites.



# Local Installation & Setup Guide

This document explains how to set up and run the project **locally** using terminal commands. These steps mirror what happens in CI but are written for local development and testing.
PS: We are assuming root for each command i.e bloggy/

---

## 1. Install Node.js (v18)

Ensure **Node.js 18** is installed on your system.

```bash
node -v
```

If not installed, use one of the following:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18
```

---

## 2. Install Project Dependencies

From the project root directory, install dependencies using a clean install:

```bash
npm ci
```

---

## 3. Install Playwright Browsers

Install Playwright-supported browsers and required system dependencies:

```bash
npx playwright install --with-deps
```

---

## 4. Start Backend & Frontend

Start the backend and frontend services together. Logs will be written to `app.log` and the process will run in the background.

```bash
npm run dev > app.log 2>&1 &
echo "App started"
```

---

## 5. Wait for Frontend to Be Ready

Ensure the frontend is running and accessible before proceeding:

```bash
npx wait-on http://localhost:5173
```

---

## 6. Install Playwright Test Dependencies

Navigate to the Playwright directory and install its dependencies:

```bash
cd playwright
npm ci
```

---

## 7. Run Playwright for All Tests(Excluding Genuine Bugs)

Navigate to the Playwright directory and install its dependencies:

```bash
cd playwright
npx playwright test --grep-invert @bugs --workers=1
```

---

## 8. Run Playwright for Bugs in App(We expect these to fail)

Navigate to the Playwright directory and install its dependencies:

```bash
cd playwright
npx playwright test --grep @bugs --workers=1
```

---
### FAQs

1. Why only one worker?
> In each test file we are resetting and seeding new data this leads to inconsistent database state and impacts test isolation

2. How to make it faster?
> Run it across multiple nodes so each node will have it's own app running an each node is isolated

3. Why are we running tests inside bloggy/playwright and not root i.e bloggy/
> There are two package.json files one inside bloggy/ other inside playwright/. We could have merged it and would have been able to run on root but then app would have been heavier. Whereas by this setup we achieve Cleaner Dependency management, App and Tests are independent.

4. Why are we using tags like @bugs?
> We found some genuine bugs in the app so we use tags to isolate runs which have/don't have bugs
---

# Test Coverage Summary

## Overview
The automation suite covers **UI, API, and end-to-end flows** for a blog application, validating functionality across **Admin users, Public users, and API consumers**.  
A total of **51 automated tests** have been executed successfully. While most happy paths were executed via UI, API focused more on negative cases which otherwise would consume heavy UI Bandwidth and resources.

---

## Coverage Breakdown

### 1. Admin User – Blog Management (UI)
**Covered**
- Create blog as draft
- Publish draft blog
- Create published blog
- Edit blog title, excerpt, and description
- Add images to blog
- Rich text editor features:
  - Headers
  - Bold, Italic, Underline, Strikethrough
  - Ordered & bullet lists
  - Text color & background
  - Image upload
  - Link insertion
  - Format editor
- Blog listing actions:
  - Pagination toggle
  - View blog
  - Edit blog
  - Delete blog and pagination adjustment

**Total Coverage:** Blog CRUD + editor behavior fully validated

---

### 2. Authentication & Authorization
**Covered**
- Negative login scenarios:
  - Wrong credentials
  - Empty / partial submissions
- Duplicate user registration (API & UI)
- Unauthorized API access restrictions

---

### 3. API Testing
**Covered**
- Blog creation validation:
  - Missing title, content, category, excerpt
  - Multiple missing fields
- Authentication validation:
  - Unauthenticated blog creation blocked
  - Duplicate user registration
- Comment API validation:
  - Unauthorized comment
  - Missing content
  - Missing author
  - Exceeding max content length
- Miscellaneous:
  - Access deleted blog via API
  - Validate public blog schema

---

### 4. Public & Admin Shared User Flows (UI)
**Covered for both Public and Admin users**
- View blog details
- Read-more navigation
- Like a blog
- Comment on a blog
- Home page actions:
  - Read icon persistence
  - Home navigation
  - Pagination toggle
  - Light/Dark mode persistence across sessions
- Search functionality:
  - Valid search
  - Invalid search parameters

---

### 5. User Registration (UI)
**Covered**
- Successful user registration
- Password length validation
- Existing user registration error

---

## Test Coverage Summary (High Level)

| Area                        | Coverage Status |
|----------------------------|-----------------|
| Blog CRUD (Admin)          | ✅ Covered |
| Rich Text Editor           | ✅ Covered |
| Blog Listing & Pagination  | ✅ Covered |
| Authentication (Negative)  | ✅ Covered |
| API Validations            | ✅ Covered |
| Public User Interactions   | ✅ Covered |
| Theme Persistence          | ✅ Covered |
| Search Functionality       | ✅ Covered |

---

## Identified Gaps / Future Enhancements

- ❌ Uploading unsupported image formats (non-JPEG/PNG)
- ❌ View counter validation for user actions
- ❌ Remove or replace uploaded images


---

## Conclusion
The current test suite provides **strong functional confidence** across critical user journeys, admin workflows, and API validations. The identified gaps represent **enhancement opportunities** rather than core functionality risks.


## Additional Test Scenarios (Not Implemented Due to Time Constraints)

The following test cases were identified as valuable but could not be implemented within the given time frame. These represent **future enhancements** to further strengthen test coverage and robustness.

---

### 1. Blog Media Handling
- Upload unsupported file formats (PDF, SVG, GIF, DOC) and validate error handling
- Upload very large images and validate size limits
- Verify image alt-text and accessibility attributes

---

### 2. Blog Draft Management Edge Cases
- Verify that a blog saved as draft does not appear on the public listing.
- Verify that draft blogs can be edited multiple times and state persists until published.s

---

### 3. Security & Authorization
- Verify JWT expiration handling for admin actions

---

### 4. Blog Publish/Unpublish Workflow
- Test unpublishing a blog after it was published, and verify it disappears from public view.
- Ensure notifications or view counts don’t increment for unpublished drafts.

---

### 6. Cross-Browser & Device Coverage
- Testing it across various browsers and possibility of devices

---

### 7. Negative & Edge UI Scenarios
- Network failure during blog creation or edit
- Session timeout during form submission
- Browser refresh during editor interactions

---

### 7. Empty States/Validations Across Apps
- New user with empty state
- Deleting all blogs and admin view
- Deleting all blogs and public view
- Empty Blog Publishing Validations

---

## Note
These scenarios were consciously deprioritized to focus on **core functionality, stability, and critical user flows** within the available time. The current test suite is structured to allow easy extension to cover these cases in future iterations.


## Possible Optimizations & Improvements

The following optimizations were identified to improve **test performance, stability, and maintainability** of the automation suite.

---

### 1. Test Execution Performance
- Parallelize long-running UI test suites more aggressively
- Split UI and API tests into separate CI jobs
- Reuse authenticated storage state instead of logging in repeatedly

---

### 2. Test Stability & Flakiness Reduction
- Prefer API setup over UI setup for preconditions
- Add network-level assertions instead of UI-only validations
- Replace fixed waits with event- or state-based assertions
- Introduce retries only for known flaky scenarios

---

### 3. Test Data Management
- Centralize test data creation and cleanup via the seed file and higher number of seed files which can run on basis on each test requirements.
- Isolate test data per worker to avoid cross-test pollution
- Add automated cleanup hooks for created entities

---

### 4. Framework & Code Structure
- Introduce reusable fixtures for common flows (auth, blog setup)
- Apply Page Object Model consistently across UI tests
- Enforce linting and formatting for test code

---

### 5. CI/CD & Reporting
- Add test tagging to selectively run smoke, regression, or API suites
- Fail fast on critical test failures

---

## Summary
These optimizations focus on **faster feedback, reduced flakiness, and long-term scalability**, ensuring the test suite remains reliable as the application grows.


# CI/CD Setup with GitHub Actions

This project uses **GitHub Actions** to automate Playwright test execution for the Bloggy app. The workflow is split into two jobs: one for running all standard tests, and another for running tests tagged as bugs in the application.

---

## Workflow Overview

### Job 1: [Playwright Tests for Bloggy](https://github.com/ojasrahate/bloggy/actions/workflows/playwright.yml)
- Runs all standard Playwright tests **excluding tests tagged as `@bugs`**.
- Ensures core functionality and regression checks are validated for every push or pull request.
- Executes with a single worker to maintain database isolation and reproducibility.
- Ideal for CI/CD pipelines to ensure that main features remain stable.

### Job 2: [Bugs in App via Playwright](https://github.com/ojasrahate/bloggy/actions/workflows/bugs_in_app.yml)
- Runs **only the tests tagged with `@bugs`**, which are known issues in the app.
- Helps track failing scenarios separately without affecting the main test suite.
- Also executes with a single worker for consistent test isolation.
- Useful for monitoring known issues over time and verifying bug fixes.

---

## Key Notes

1. **Separation of Jobs**  
   Splitting regular tests and bug-specific tests provides clearer reporting and prevents flaky bug tests from impacting the main CI/CD pipeline.

2. **Test Tagging**  
   - `@bugs` — used to identify tests covering known bugs.  
   - Tests without this tag are part of the main Playwright test suite.

4. **Purpose**  
   This CI/CD setup ensures both **stable feature validation** and **tracking of known bugs**, maintaining high confidence in production readiness.


## Test Artifacts & Reports

We can find test reports in artifacts of the above CI/CD Runs.I am attaching two artifacts below
Successful Run Artifact: We can Fetch this from https://github.com/ojasrahate/bloggy/actions/workflows/bugs_in_app.yml from the latest run under artifacts
Failure Run Artifact:  We can Fetch this from https://github.com/ojasrahate/bloggy/actions/workflows/bugs_in_app.yml from the latest run under artifacts
- **Successful Run Artifact**: [Download here](./success_playwright.zip)
- **Failure Run Artifact**: [Download here](./failure_playwright.zip)


The following files and folders contain the results, traces, screenshots, and logs from the latest automated test runs.

### 1. Test Results
Folder: `test-results/`

- **Trace File:** [trace.zip](./failure_playwright/test-results/bugs_in_app-fe_bugs-Admin--53294-on-refresh-or-changing-urls/trace.zip) – Contains Playwright trace for debugging failed tests.  
- **Screenshots:** [Screenshot folder](./failure_playwright/test-results/bugs_in_app-fe_bugs-Admin--53294-on-refresh-or-changing-urls/test-failed-1.png) – Screenshots captured during test failures.  
- **Error Logs:** [Error.md](./failure_playwright/test-results/bugs_in_app-fe_bugs-Admin--53294-on-refresh-or-changing-urls/Error.md) – Consolidated error logs from the test run.

### 2. Playwright Report
Folder: `playwright-report/`

- **HTML Report:** [index.html](./success_playwright/playwright-report/index.html) – Interactive Playwright test report.  
- **Supporting Data:** `data/` – Raw data used by the HTML report.  
- **Trace Folder:** `trace/` – Trace files for detailed inspection of test execution.

### 3. Test Setup Logs
- **Setup Log:** [test setup log](./failure_playwright/test-setup-log.txt) – Terminal output from environment setup and seeding.

---

### How to Use

- Open **index.html** in `playwright-report/` in a browser for a full interactive test report.  
- Use **trace.zip** with Playwright CLI (`npx playwright show-trace trace.zip`) to replay failed tests step by step.  
- Check **Error.md** and **Screenshots** for quick debugging of failures.  

---

## 1. Environment Assumptions

- **Node.js Version:** Node.js v18 is assumed to be installed and used for both local development and CI/CD pipelines.
- **Project Structure:** The repository has two `package.json` files — one in the root (`bloggy/`) and one in `bloggy/playwright/`.
- **Database State:** Each test file resets and seeds the database. This ensures test isolation but assumes that the seed scripts are reliable and deterministic.
- **Browsers:** Playwright-installed browsers (Chromium, Firefox, WebKit) are assumed to be available for testing.
- **Ports & URLs:** Frontend is expected to run on `http://localhost:5173`. Backend is expected to run on `http://localhost:3001`.Tests may fail if the port or base URL is different.

---

## 2. Test Assumptions

- **Single Worker Execution:** All tests run with one worker to prevent conflicts and maintain database isolation.
- **Tags:** Tests use the `@bugs` tag to isolate known failing scenarios. Tests without this tag are assumed to be stable.
- **Data Dependencies:** Tests assume that data created during setup (via seed scripts) is valid and complete.
- **Test Coverage Scope:**  
  - Core CRUD operations, authentication, API validations, and UI flows are covered.  
  - Edge cases and negative flows beyond core features may not be fully implemented.

---

## 3. CI/CD Assumptions

- **GitHub Actions:** The CI/CD workflow assumes the repository is hosted on GitHub with Actions enabled.
- **Job Separation:** Regular tests and bug-specific tests run in separate jobs to avoid failing the main suite due to known bugs.
- **Worker Isolation:** Each job assumes a clean environment with no shared database state.

---

## 4. Notes for Developers & Testers

- **Extending Tests:** Future enhancements (e.g., unsupported media uploads, cross-browser device testing) can be added without changing the core workflow.
- **Environment Variables:** If additional environment variables are required (API keys, secrets), they should be stored in GitHub Secrets or `.env` files.
- **Debugging CI Failures:** Logs are available in GitHub Actions and can be used with Playwright trace viewers, screenshots, and videos.
- **Maintaining Test Data:** Avoid hard-coding IDs or data; always use the seeding mechanism for reliable test execution.
- **Documentation Updates:** Any new workflow, tag, or major change in the app should be reflected in this MD file to keep the guide accurate.

---

## 5. General Assumption

The current setup prioritizes **stability, isolation, and reproducibility** over execution speed. Parallelization or aggressive optimizations should only be applied once database isolation and test reliability are fully ensured.
