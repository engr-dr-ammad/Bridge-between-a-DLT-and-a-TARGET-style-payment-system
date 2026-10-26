# Contributing to DLT-TARGET Bridge

## Code Style

- **Language**: TypeScript
- **Formatter**: Prettier (run `npm run format`)
- **Linter**: ESLint (run `npm run lint`)
- **Tests**: Jest with >80% coverage target

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit with clear messages
3. Run tests: `npm test`
4. Ensure linting passes: `npm run lint`
5. Build: `npm run build`
6. Push and create a pull request

## Adding Features

### New API Endpoint

1. Add types in `src/types.ts`
2. Implement handler logic in appropriate module
3. Add route in `src/routes.ts`
4. Write tests in `tests/`
5. Update README.md with endpoint documentation

### Extending DLT Handler

Modify `src/dlt-handler.ts`:
- Implement real DLT connections
- Add transaction verification
- Integrate blockchain event listeners

### Extending Settlement System

Modify `src/settlement-system.ts`:
- Connect to real TARGET/RTGS API
- Implement actual payment processing
- Add SWIFT messaging

### Adding ISO 20022 Support

Extend `src/iso20022.ts`:
- Support additional message types (pain.002, pain.008, etc.)
- Add XML validation
- Implement message signing

## Testing Requirements

All new code must include tests:

```typescript
describe('FeatureName', () => {
  test('should handle expected input', () => {
    // Arrange
    // Act
    // Assert
  });

  test('should handle edge cases', () => {
    // ...
  });
});
```

Run tests:
```bash
npm test                  # Run all
npm run test:watch      # Watch mode
```

## Commit Messages

Use clear, descriptive messages:

```
feat: add settlement confirmation callback
fix: resolve asset lock timeout issue
docs: update deployment guide
test: add DLT handler edge case tests
refactor: simplify ISO 20022 message generation
```

## Pull Request Template

```
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Performance improvement
- [ ] Refactoring

## Related Issues
Fixes #(issue number)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No breaking changes
```

## Performance Considerations

1. **In-memory Storage**: Replace with database for production
2. **Async Operations**: Use proper async/await patterns
3. **Error Handling**: Always catch and log errors
4. **Logging**: Use structured logging for debugging

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] API authentication/authorization
- [ ] No hardcoded secrets
- [ ] HTTPS enforced in production
- [ ] SQL injection prevention (if using DB)
- [ ] Rate limiting implemented
- [ ] CORS properly configured

## Documentation

Update documentation for:
- New endpoints: Add to README.md API section
- Configuration: Update DEPLOYMENT.md
- Architecture changes: Update relevant docs
- Breaking changes: Add migration guide

## Code Review

Reviews check for:
- Correctness and logic
- Code style consistency
- Test coverage
- Documentation completeness
- Performance impact
- Security issues

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push to GitHub
5. Create GitHub release
6. Build Docker image: `docker build -t dlt-target-bridge:1.0.0 .`
7. Push to registry

## Questions?

Open an issue with:
- Clear title
- Detailed description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details

---

Thank you for contributing!
