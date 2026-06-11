# fcp-sfd-comms-publisher-stub

## Prerequisites
- Docker
- Docker Compose
- Node.js (v24)

## API

When the API is enabled (default for non-production environments) the following endpoints are available:

| Method | Endpoint                          | Description                         |
|--------|----------------------------------|-------------------------------------|
| `POST` | `/api/v1/simulate/messages`      | Simulate the publishing of messages to `fcp-sfd-comms`. |

All `/api/v1/simulate` endpoints accept the following optional query parameters:

| Parameter   | Type    | Description                                                                 |
|-------------|---------|-----------------------------------------------------------------------------|
| `scenario`  | String  | The name of a specific scenario to simulate. If not provided all scenarios will be simulated. |
| `repetitions` | Integer | The number of times to repeat the scenario(s). Default is `1`. |

## Requirements

### Docker

This application is intended to be run in a Docker container to ensure consistency across environments.

Docker can be installed from [Docker's official website](https://docs.docker.com/get-docker/).

## Local development

### Running the application

> ⚠️ You cannot run this service independently, it is intended to be run alongside [fcp-sfd-comms](https://github.com/DEFRA/fcp-sfd-comms).
> [fcp-sfd-comms](https://github.com/DEFRA/fcp-sfd-comms) should be started first.
> Follow [the instructions](https://github.com/DEFRA/fcp-sfd-comms/blob/change-localstack-ports/README.md#Running-the-application) to start the latter for local development.
> The `aws` resources required for both services are all owned and created by fcp-sfd-comms locally.

##### Build container image

The service runs inside a Docker container and the container image can be built using Docker Compose:
```
docker compose build
```

##### Start the container

Once built, the container is also started via Docker Compose:

```
docker compose up -d
```

### Setup

Install application dependencies:

```bash
npm install
```

### Development

Build the Docker container:

```bash
npm run dev:build
```

Run the container in `development` mode:

```bash
npm run docker:dev
```

### Testing

To test the application run:

```bash
npm run docker:test
```

Tests can also be run in `watch` mode to support test driven development (TDD):

```bash
npm run docker:test:watch
```

## SonarQube Cloud scan

Run a local scan against [SonarCloud](https://sonarcloud.io/project/overview?id=DEFRA_fcp-sfd-comms-publisher-stub) for the current git branch. See the [DEFRA SonarCloud guide](https://github.com/DEFRA/cdp-documentation/blob/main/how-to/sonarcloud.md) for organisation access and CI setup.

### Setup

1. Log in to [SonarQube Cloud](https://sonarcloud.io) with your DEFRA GitHub account
2. Go to **My Account → Security → Generate Tokens** and create a personal token
3. Add `SONAR_TOKEN=<your-token>` to your `.env` file
4. Ensure Docker is running

### Run

Generate test coverage first, then scan:

```bash
npm run docker:test
npm run sonar
```

The script uploads results for the current branch and prints:

- Quality gate pass/fail and failed conditions
- Open issues on new code (when the gate fails)
- **Accepted / false-positive issues without comment** — DEFRA quality gates require a justification comment on each suppressed issue; add comments in SonarCloud under the issue **Activity** tab

Exit code is `0` when the gate passes and all suppressed issues are commented, `1` otherwise.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
