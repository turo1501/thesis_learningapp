# Learning Management System Testing Suite

This directory contains comprehensive test suites for the LMS platform, covering both frontend and backend components. Our testing approach follows industry best practices with a focus on test automation, reliability, and comprehensive coverage.

## 📑 Testing Structure

```
test/
├── e2e/                     # End-to-end tests with Playwright
│   ├── auth/                # Authentication flows
│   ├── dashboard/           # Dashboard features by role
│   │   ├── admin/           # Admin dashboard tests
│   │   ├── teacher/         # Teacher dashboard tests
│   │   └── user/            # Student dashboard tests
│   ├── nondashboard/        # Public pages and features
│   └── utils/               # Test utilities and helpers
├── integration/             # API integration tests
│   ├── controllers/         # Controller tests
│   ├── routes/              # API route tests
│   └── utils/               # Test utilities
├── unit/                    # Unit tests for both client & server
│   ├── client/              # Frontend component tests
│   │   ├── components/      # UI component tests
│   │   ├── hooks/           # Custom hooks tests
│   │   └── state/           # Redux state tests
│   └── server/              # Backend unit tests
│       ├── controllers/     # Controller unit tests
│       ├── models/          # Model unit tests
│       └── utils/           # Utility function tests
├── mock/                    # Mock data and fixtures
├── performance/             # Performance testing scripts
└── config/                  # Test configuration files
```

## 🧰 Testing Tools

- **E2E Testing**: Playwright
- **API Testing**: Supertest, Jest
- **Unit Testing**: Jest, React Testing Library
- **Mock Server**: MSW (Mock Service Worker)
- **Coverage Reports**: Istanbul
- **Visual Regression**: Percy
- **Load Testing**: k6

## 🚀 Running Tests

```bash
# Install test dependencies
npm run test:setup

# Run all tests
npm test

# Run specific test suites
npm run test:e2e
npm run test:unit
npm run test:integration

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- path/to/test-file.spec.ts
```

## 🔄 CI/CD Integration

Tests are automatically run in the CI/CD pipeline on:
- Pull requests to main/develop branches
- Nightly builds
- Pre-release checks

## 📊 Test Reports

Test reports are generated in multiple formats:
- HTML reports in `./test-results/html`
- JUnit XML reports for CI integration
- Coverage reports in `./coverage`

## 🧠 Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Arrange-Act-Assert**: Follow the AAA pattern for test structure
3. **Use Test Data Builders**: Create flexible test data builders
4. **Avoid Test Interdependence**: Tests should not depend on execution order
5. **Mock External Dependencies**: Use dependency injection and mocks
6. **Test Real User Flows**: E2E tests should mimic actual user behavior
7. **Maintainable Selectors**: Use data-testid attributes for selection
8. **Performance Awareness**: Optimize tests for quick execution

## 📝 Writing New Tests

When adding new features, please:
1. Write tests before or alongside feature development
2. Ensure tests are descriptive and cover edge cases
3. Follow existing patterns for consistency
4. Include both happy path and error scenarios
5. Tag tests appropriately for selective running