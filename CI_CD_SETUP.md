# CI/CD Setup - Secure Insurance Platform

## Overview

This document describes the comprehensive CI/CD (Continuous Integration/Continuous Deployment) setup for the **Secure Insurance Platform**. The CI/CD pipeline automates testing, code quality checks, security analysis, and deployment processes.

---

## GitHub Actions Workflow

### Location
`.github/workflows/test.yml`

### Trigger Events
The CI/CD pipeline runs automatically on:
- **Push to main branch** - Full pipeline execution
- **Push to develop branch** - Full pipeline execution
- **Pull Requests to main** - Full pipeline with status checks
- **Pull Requests to develop** - Full pipeline with status checks

### Supported Node.js Versions
- Node.js 18.x (LTS)
- Node.js 20.x (Active LTS)

---

## Pipeline Jobs

### 1. Code Quality Checks (`lint-and-format`)

**Purpose**: Ensure code meets quality standards and style guidelines

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies with `npm ci --legacy-peer-deps`
4. Run Solhint (Solidity linter) - `npm run lint:sol`
5. Run ESLint (TypeScript/JavaScript linter) - `npm run lint`

**Failure Conditions**:
- Solhint errors
- ESLint errors

**Status**: ✅ Blocking (pipeline fails if this job fails)

---

### 2. Test Suite (`test`)

**Purpose**: Run comprehensive test suite across multiple Node.js versions

**Matrix Strategy**:
- Runs in parallel on Node.js 18.x and 20.x
- Ensures compatibility across LTS versions

**Steps**:
1. Checkout code
2. Setup Node.js (matrix version)
3. Install dependencies
4. Compile smart contracts
5. Run test suite (65 tests)
6. Generate coverage report
7. Upload coverage to Codecov

**Coverage Metrics**:
- Statements coverage
- Branch coverage
- Function coverage
- Line coverage

**Codecov Integration**:
- Coverage reports uploaded automatically
- Flags: `unittests`
- Fails gracefully if Codecov is unavailable

**Status**: ✅ Blocking (pipeline fails if tests fail)

---

### 3. Contract Size Check (`contract-size`)

**Purpose**: Ensure smart contracts stay under Ethereum size limits

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Compile contracts
5. Check contract sizes with `hardhat-contract-sizer`

**Size Limits**:
- Maximum contract size: 24 KB (Ethereum limit)
- Current sizes:
  - PauserSet: 0.585 KiB ✅
  - PrivateVehicleInsurance: 9.864 KiB ✅

**Status**: ✅ Blocking (fails if contracts exceed limits)

---

### 4. Security Analysis (`security-analysis`)

**Purpose**: Identify security vulnerabilities in dependencies

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Run `npm audit --audit-level=moderate`
5. Compile contracts for static analysis

**Audit Levels**:
- Checks for moderate, high, and critical vulnerabilities
- Continues on error (non-blocking for now)

**Status**: ⚠️ Non-blocking (reports issues but doesn't fail pipeline)

---

### 5. TypeScript Type Checking (`type-check`)

**Purpose**: Ensure TypeScript code is type-safe

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Run TypeScript compiler in check mode

**Command**: `npm run type-check` (runs `tsc --noEmit`)

**Status**: ✅ Blocking (fails on type errors)

---

### 6. Build Frontend (`build-frontend`)

**Purpose**: Verify Next.js frontend builds successfully

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Build Next.js application with `npm run build`

**Environment**:
- `NEXT_TELEMETRY_DISABLED=1` (disables telemetry)

**Status**: ✅ Blocking (fails if build fails)

---

### 7. All Checks Complete (`all-checks-complete`)

**Purpose**: Final summary job that depends on all other jobs

**Dependencies**:
- `lint-and-format`
- `test`
- `contract-size`
- `security-analysis`
- `type-check`
- `build-frontend`

**Output**:
```
✅ All CI/CD checks passed successfully!
- Code quality checks: PASSED
- Test suite: PASSED
- Contract size check: PASSED
- Security analysis: PASSED
- Type checking: PASSED
- Frontend build: PASSED
```

**Status**: ✅ Final validation

---

## Code Quality Tools

### 1. Solhint (Solidity Linter)

**Configuration**: `.solhint.json`

**Rules Enforced**:
- Compiler version compliance (^0.8.0)
- Function visibility enforcement
- Maximum line length (120 characters)
- NatSpec documentation requirements
- Naming conventions (camelCase, mixedCase, snake_case)
- Gas optimization warnings
- Security best practices

**Commands**:
```bash
# Run Solhint
npm run lint:sol

# Auto-fix issues
npm run lint:fix
```

**Current Status**:
- 190+ warnings (mostly documentation and gas optimization)
- 0 errors
- Warnings are non-blocking in CI

---

### 2. ESLint (TypeScript/JavaScript Linter)

**Configuration**: Next.js default ESLint config

**Rules**:
- Next.js best practices
- React hooks rules
- TypeScript strict mode

**Commands**:
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

---

### 3. TypeScript Type Checking

**Configuration**: `tsconfig.json` (Frontend) and `tsconfig.hardhat.json` (Contracts)

**Strict Mode**:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- All strict TypeScript checks enabled

**Commands**:
```bash
# Type check
npm run type-check
```

---

## Code Coverage with Codecov

### Configuration

**File**: `codecov.yml`

**Coverage Targets**:
- Project coverage: Auto-target with 1% threshold
- Patch coverage: 80% target with 5% threshold
- Range: 70-100%

**Ignore Patterns**:
- Test files (`test/**/*`)
- Scripts (`scripts/**/*`)
- Deploy scripts (`deploy/**/*`)
- Generated types (`typechain-types/**/*`)
- Configuration files (`**/*.config.ts`)

### Setup Instructions

1. **Sign up for Codecov**:
   - Visit https://codecov.io
   - Sign in with GitHub account
   - Add your repository

2. **Get Codecov Token**:
   - Navigate to repository settings in Codecov
   - Copy the upload token

3. **Add Secret to GitHub**:
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Create new secret: `CODECOV_TOKEN`
   - Paste the Codecov token

4. **Verify Integration**:
   - Push code to trigger CI
   - Check Codecov dashboard for coverage reports

### Coverage Reports

**Local Generation**:
```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

**CI Generation**:
- Automatically generated on every test run
- Uploaded to Codecov
- Visible in PR comments

---

## NPM Scripts Reference

### Testing
```bash
npm test                    # Run all tests
npm run test:coverage       # Run tests with coverage
```

### Compilation
```bash
npm run compile             # Compile smart contracts
npm run clean               # Clean artifacts
npm run typechain           # Generate TypeChain types
```

### Linting
```bash
npm run lint                # Lint Next.js code
npm run lint:sol            # Lint Solidity contracts
npm run lint:fix            # Auto-fix Solidity issues
```

### Type Checking
```bash
npm run type-check          # Check TypeScript types
```

### Contract Analysis
```bash
npm run size                # Check contract sizes
```

### Frontend
```bash
npm run dev                 # Start dev server (port 1362)
npm run build               # Build for production
npm run start               # Start production server
```

### Deployment
```bash
npm run deploy:local        # Deploy to local Hardhat network
npm run deploy:sepolia      # Deploy to Sepolia testnet
npm run node                # Start Hardhat node
```

---

## CI/CD Workflow Diagram

```
┌─────────────────────────────────────────────┐
│         GitHub Push/PR to main/develop      │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          │  GitHub Actions │
          │    Triggered    │
          │                 │
          └────────┬────────┘
                   │
   ┌───────────────┴───────────────┐
   │                               │
   ▼                               ▼
┌─────────────────┐       ┌─────────────────┐
│ lint-and-format │       │   test (18.x)   │
│   (Node 20.x)   │       │                 │
│                 │       ├─────────────────┤
│ ✓ Solhint       │       │ ✓ Compile       │
│ ✓ ESLint        │       │ ✓ Run tests     │
└─────────────────┘       │ ✓ Coverage      │
                          │ ✓ Codecov       │
                          └─────────────────┘
                                  │
                          ┌───────┴────────┐
                          │                │
                          ▼                ▼
                  ┌─────────────┐  ┌─────────────┐
                  │test (20.x)  │  │contract-size│
                  │             │  │  (Node 20)  │
                  │✓ Same steps │  │             │
                  └─────────────┘  │✓ Size check │
                                   └─────────────┘
                                          │
                  ┌───────────────────────┴────────┐
                  │                                │
                  ▼                                ▼
          ┌──────────────┐              ┌──────────────┐
          │security-     │              │  type-check  │
          │analysis      │              │  (Node 20)   │
          │(Node 20)     │              │              │
          │              │              │✓ TypeScript  │
          │✓ npm audit   │              └──────────────┘
          └──────────────┘                      │
                  │                             │
                  └──────────┬──────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │ build-frontend   │
                   │   (Node 20)      │
                   │                  │
                   │ ✓ Next.js build  │
                   └──────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │all-checks-       │
                   │complete          │
                   │                  │
                   │✅ Success Report│
                   └──────────────────┘
```

---

## Branch Protection Rules (Recommended)

### For `main` branch:

1. **Require status checks to pass**:
   - ✅ lint-and-format
   - ✅ test (18.x)
   - ✅ test (20.x)
   - ✅ contract-size
   - ✅ type-check
   - ✅ build-frontend

2. **Require branches to be up to date**: Yes

3. **Require pull request reviews**: 1 approving review

4. **Dismiss stale reviews**: Yes

5. **Require review from code owners**: Optional

6. **Require linear history**: Recommended

7. **Include administrators**: No (for flexibility)

### For `develop` branch:

Same as `main` but with optional review requirement for faster iteration.

---

## Troubleshooting

### Issue: Tests Fail in CI but Pass Locally

**Solution**:
1. Check Node.js version matches CI (18.x or 20.x)
2. Run `npm ci --legacy-peer-deps` instead of `npm install`
3. Verify environment variables are set correctly
4. Check for timing issues in tests

### Issue: Codecov Upload Fails

**Solution**:
1. Verify `CODECOV_TOKEN` secret is set in GitHub
2. Check coverage file exists: `coverage/lcov.info`
3. Review Codecov action logs for errors
4. Ensure Codecov token hasn't expired

### Issue: Contract Size Check Fails

**Solution**:
1. Review contract sizes with `npm run size`
2. Optimize contract code if over 24 KB limit
3. Consider splitting large contracts
4. Remove unused code and imports

### Issue: ESLint Failures

**Solution**:
1. Run `npm run lint` locally
2. Auto-fix with `npm run lint -- --fix`
3. Review and fix remaining issues manually
4. Update ESLint config if needed

### Issue: Solhint Warnings

**Solution**:
1. Run `npm run lint:sol` locally
2. Auto-fix with `npm run lint:fix`
3. Add NatSpec documentation
4. Review gas optimization suggestions
5. Update `.solhint.json` to adjust rules

---

## Performance Metrics

### Current CI/CD Performance

- **Average Pipeline Duration**: ~3-5 minutes
- **Parallel Job Execution**: Yes (matrix builds)
- **Cached Dependencies**: Yes (npm cache)
- **Artifact Retention**: 90 days (default)

### Optimization Tips

1. **Use caching**:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'
   ```

2. **Run independent jobs in parallel**:
   - Already implemented for test matrix
   - All non-dependent jobs run concurrently

3. **Fail fast**:
   - Code quality checks run first
   - Expensive jobs only run if linting passes

---

## Security Best Practices

### Secrets Management

1. **Never commit secrets**: Use GitHub Secrets
2. **Rotate tokens**: Update Codecov token annually
3. **Limit scope**: Use minimum required permissions
4. **Audit access**: Review who has access to secrets

### Dependency Security

1. **Regular audits**: `npm audit` runs in CI
2. **Update dependencies**: Review and update monthly
3. **Pin versions**: Lock to specific versions
4. **Review PRs**: Check Dependabot PRs carefully

---

## Future Enhancements

### Planned Improvements

1. **Deployment Automation**:
   - Auto-deploy to staging on develop push
   - Manual approval for production deployment
   - Sepolia testnet deployment automation

2. **Additional Quality Checks**:
   - Slither static analysis for Solidity
   - MythX security scanning
   - Gas profiling and optimization reports

3. **Performance Monitoring**:
   - Bundle size tracking
   - Test execution time tracking
   - Contract gas usage benchmarks

4. **Notification Integration**:
   - Slack notifications for failed builds
   - Discord integration for releases
   - Email alerts for security issues

5. **Release Automation**:
   - Semantic versioning
   - Automated changelog generation
   - GitHub releases creation

---

## Contributing Guidelines

### Before Submitting PR

1. ✅ Run tests locally: `npm test`
2. ✅ Check linting: `npm run lint` and `npm run lint:sol`
3. ✅ Verify types: `npm run type-check`
4. ✅ Build frontend: `npm run build`
5. ✅ Ensure all checks pass

### PR Checklist

- [ ] All tests passing
- [ ] Code quality checks passing
- [ ] Coverage maintained or improved
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Commit messages follow conventions
- [ ] PR description is clear

---

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Hardhat Documentation](https://hardhat.org/docs)

### Tools
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Codecov Dashboard](https://app.codecov.io)
- [npm Audit Advisory](https://www.npmjs.com/advisories)

---

## Summary

The **Secure Insurance Platform** CI/CD pipeline provides:

- ✅ Automated testing across multiple Node.js versions
- ✅ Comprehensive code quality checks (ESLint, Solhint)
- ✅ TypeScript type safety verification
- ✅ Contract size monitoring
- ✅ Security vulnerability scanning
- ✅ Code coverage tracking with Codecov
- ✅ Frontend build validation
- ✅ Fast feedback (<5 minutes)

**Status**: ✅ Fully Configured and Ready for Production

---

**Last Updated**: 2025-10-23
**CI/CD Version**: 1.0.0
