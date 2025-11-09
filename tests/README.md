# Unit Tests

This folder contains comprehensive unit tests for the MoodMeal application.

## Test Structure

The tests are organized into separate files by functionality:

### 📄 Test Files

1. **auth.test.js** - Authentication Tests
   - Login functionality
   - Password hashing with bcrypt
   - Email validation
   - Session management
   - User role identification

2. **recipes.test.js** - Recipe CRUD Tests
   - Recipe structure validation
   - Active/inactive status handling
   - Mood filtering
   - Recipe creation and updates
   - Ingredients and instructions parsing

3. **users.test.js** - User Management Tests
   - User creation (admin and regular)
   - Email validation
   - Password security
   - Admin authorization
   - User listing and data mapping

4. **toggle.test.js** - Active/Inactive Toggle Tests
   - Toggle functionality
   - Status validation
   - User visibility based on status
   - UI state management
   - Error handling

5. **integration.test.js** - Integration Tests
   - End-to-end user flows
   - Admin workflows
   - Data consistency
   - Error handling flows
   - Session management
   - Authorization flows

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx jest tests/auth.test.js
```

### Run Tests with Coverage
```bash
npm test
```
(Coverage is included by default)

## Test Coverage

The test suite covers:

- ✅ Authentication and authorization
- ✅ Recipe CRUD operations
- ✅ User management
- ✅ Active/inactive toggle functionality
- ✅ Data validation
- ✅ Error handling
- ✅ Session management
- ✅ Integration workflows

## Dependencies

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **bcrypt**: Password hashing (used in tests)

## Test Environment

- Node.js environment
- Tests run in isolation
- No database required (tests use mocked data)

## Writing New Tests

When adding new features, create tests that follow this pattern:

```javascript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = processInput(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

## Best Practices

1. **Descriptive test names**: Use clear, descriptive names that explain what is being tested
2. **Single responsibility**: Each test should test one specific thing
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Independent tests**: Tests should not depend on each other
5. **Mock external dependencies**: Use mocks for database, API calls, etc.

## Continuous Integration

These tests can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test
```

## Troubleshooting

If tests fail:

1. Check that all dependencies are installed: `npm install`
2. Ensure you're running tests from the project root
3. Check for any conflicting processes on test ports
4. Review the test output for specific error messages

## Future Enhancements

Potential additions to the test suite:

- [ ] API endpoint integration tests with actual server
- [ ] Frontend component tests
- [ ] Performance tests
- [ ] Security tests
- [ ] Load tests
- [ ] E2E tests with database

## Contributing

When contributing:

1. Write tests for new features
2. Update existing tests if you modify functionality
3. Ensure all tests pass before submitting PR
4. Maintain test coverage above 80%

