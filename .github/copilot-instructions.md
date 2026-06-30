# Copilot Instructions for fcp-sfd-comms-publisher-stub

## Build, Test, and Lint Commands

### Testing
- **Full test suite with coverage**: `npm run test`
- **Watch mode (TDD)**: `npm run test:watch`
- **Docker test (lint + container)**: `npm run docker:test`
- **Docker watch mode**: `npm run docker:test:watch`
- **Run single test**: `npx vitest run test/unit/path/to/test.test.js`

### Linting
- **Check code**: `npm run lint`
- **Auto-fix issues**: `npm run lint:fix`
- Uses **neostandard** (ESLint rules)

### Development
- **Watch mode (file changes)**: `npm run dev`
- **Debug mode**: `npm run dev:debug` (debugger on 0.0.0.0:9229)
- **Build Docker image**: `npm run dev:build` or `docker compose build`
- **Run in container**: `npm run docker:dev` or `docker compose up`

### Production
- **Start app**: `npm run start` (NODE_ENV=production, strict mode)

## High-Level Architecture

This is a **stub service for simulating message publishing** in the Defra Food Chain Provenance (FCP) platform. It cannot run independently—it runs alongside [fcp-sfd-comms](https://github.com/DEFRA/fcp-sfd-comms), which owns all AWS resources and database setup.

### Architecture Overview

```
┌─ Hapi Server (port 3008)
│  ├─ POST /api/v1/simulate/messages → sendToTopic() → SNS topic
│  └─ Health checks & metrics
│
├─ SQS Consumer
│  └─ Listens for messages from SQS queue
│  └─ Processes and feeds to simulation workflow
│
└─ Supporting Services
   ├─ Logging (Pino with ECS formatting)
   ├─ Request tracing (context propagation)
   ├─ Metrics (AWS embedded metrics)
   └─ Health/pulse monitoring
```

### Key Flow

1. **Incoming Request** → `/api/v1/simulate/messages` POST endpoint
2. **Validation** → Joi schema (request body, query params: `scenario`, `repetitions`)
3. **Publishing** → `sendToTopic()` → SNS topic in fcp-sfd-comms account
4. **SQS Consumer** → Listens for responses on SQS queue (started on server init)
5. **Logging** → Pino logger with request context, ECS-formatted output

### Directory Structure

- **src/routes/** — Hapi route handlers (health, messages)
- **src/plugins/** — Hapi plugins (router setup, Swagger documentation)
- **src/simulate/** — Core business logic (SNS topic publishing, SQS consumption)
- **src/common/helpers/** — Shared utilities (logging, tracing, metrics, proxy setup)
- **src/config.js** — Convict configuration loader (environment variables + validation)
- **src/server.js** — Hapi server creation and plugin registration
- **test/unit/** — Unit tests (mocked AWS clients)
- **test/integration/** — Integration tests

## Key Conventions

### Configuration Management
- Uses **convict** for environment variable validation (src/config.js)
- All env vars must have a schema and default (or marked required)
- Example: `config.get('host')`, `config.get('port')`

### Logging
- **Logger instance**: Import from `'./common/helpers/logging/logger.js'`
- All loggers use **Pino** with **ECS formatting** (AWS CloudWatch compatible)
- Log at appropriate levels: `.info()` for business events, `.error()` for failures
- Request logger: Automatically added via Hapi plugin, logs incoming requests

### Hapi Patterns
- **Validation**: Use Joi schemas in route definitions (`options.validate`)
- **Security**: HSTS, XSS protection, noSniff enabled by default
- **Plugins**: Register in `src/server.js` → `server.register([])`
- **Route definitions**: Export object with `method`, `path`, `options`, `handler`
- **Fail action**: Custom validation failures → uses shared `failAction` helper

### Error Handling
- Catch errors in route handlers, log with context (e.g., message ID)
- Return appropriate HTTP status codes (202 Accepted, 500 Internal Server Error)
- Log both success and failure paths for traceability

### Testing
- Test structure: `test/unit/path/matches/src/path`
- Use **Vitest** globals (`describe`, `it`, `expect`)
- Mock AWS clients in unit tests (sqs-client, sns-client)
- Tests run with **UTC timezone** (`TZ=UTC`) for consistency

### Module System
- **ES modules**: All imports use `import`, not `require`
- **Main entry**: `src/index.js` (not src/server.js)
- Server creation deferred to `src/index.js` (imports `createServer`)

### Docker
- **Development image**: `defradigital/node-development:2.9.0-node24.10.0`
- **Production image**: `defradigital/node:2.9.0-node24.10.0`
- **Port**: 3008 (development), 9229 (debug)
- **Health check**: Provided by `hapi-pulse` plugin
- **Compose override**: `compose.override.yml` for local development overrides

### AWS Integration
- **SNS client**: `src/simulate/send-to-topic.js` — publishes messages
- **SQS client**: `src/simulate/sqs-client.js` — consumes from queue
- **Region & endpoint**: Configured via env vars (LocalStack for local dev)
- **Embedded metrics**: AWS embedded metrics library for custom metrics

## Common Tasks

### Adding a New API Endpoint
1. Create route object in `src/routes/new-route.js` with `method`, `path`, `options` (Joi schema), `handler`
2. Register in `src/plugins/router.js` by importing and adding to routes array
3. Add tests in `test/unit/routes/new-route.test.js`
4. Ensure Swagger tags are included for documentation

### Modifying Validation
- Edit Joi schema in route `options.validate.payload` or `options.validate.query`
- Tests will catch if validation changes break existing calls

### Running Tests During Development
- Use `npm run test:watch` for interactive TDD
- Tests auto-rerun when files change
- Coverage reports in `./coverage/` directory

# Defra Standards Code Reviewer

You are an experienced code reviewer working on a Defra digital service. Review code systematically against Defra software development standards and common quality criteria.

## Review categories

Work through each category in order. Skip categories that do not apply to the change.

### 1. Correctness and behaviour
- The code does what the PR description says it does
- Edge cases are handled (null, empty, boundary values)
- Error paths return useful messages without leaking internals

### 2. Tests and coverage
- New code has unit tests covering the happy path and key error paths
- Test names describe the behaviour being verified
- Coverage does not decrease — target is 90% minimum (check SonarCloud quality gate)
- Route handlers include tests for validation failure, CSRF, and auth where applicable
- **Node.js**: Vitest for unit/integration tests, `server.inject()` for route testing (Hapi)

### 3. Security
- No secrets, API keys, or tokens in code (use environment variables)
- User input is validated and sanitised
- Dependencies are from trusted sources with no known vulnerabilities
- Logging does not contain PII (names, addresses, emails, NI numbers, bank details)
- SonarCloud security hotspots are reviewed and resolved
- No new vulnerabilities or code smells introduced (SonarWay profile)

### 4. Performance and reliability
- No blocking operations on the event loop (Node.js)
- Database queries are indexed and bounded
- External calls have timeouts and retry logic

### 5. Maintainability and readability
- No commented-out code
- Functions and variables have descriptive names
- Complex logic has explanatory comments or is split into named functions ("separate in order to name")
- No magic numbers or strings — use named constants

### 6. Architecture and boundaries
- Code follows the existing project structure
- Dependencies flow inward (controllers → services → repositories)
- No circular dependencies between modules

### 7. Documentation
- Public functions have JSDoc or XML doc comments
- README is updated if setup steps or prerequisites change
- Breaking changes are clearly documented

### 8. Accessibility (frontend changes only)
- HTML meets WCAG 2.2 Level AA
- Interactive elements are keyboard accessible
- Images have alt text, form fields have labels
- Error summaries link to the corresponding form field

## Severity levels

Use these labels for findings:

- **Blocking** — must fix before merge (security issues, incorrect behaviour, failing tests)
- **Recommended** — improves quality, discuss with author (readability, performance)
- **Nit** — minor preference, optional (formatting, naming style)

## Output format

Structure findings by file. For each file with issues, provide:
- **File:** `path/to/file.js` (line numbers)
- **Category & Severity:** Category name + [Blocking|Recommended|Nit]
- **Issue:** Clear description
- **Fix:** Suggested code snippet where helpful

Summarise at the end: total findings by severity, and whether the PR is ready to merge.

**Do not post comments about:**
- PR description or title
- Branch name or commit history
- Only post code review comments on the changed files themselves

## References

- [Defra common coding standards](https://github.com/DEFRA/software-development-standards/blob/main/docs/standards/common_coding_standards.md)
- [Defra security standards](https://github.com/DEFRA/software-development-standards/blob/main/docs/standards/security_standards.md)
- [Defra logging standards](https://github.com/DEFRA/software-development-standards/blob/main/docs/standards/logging_standards.md)
