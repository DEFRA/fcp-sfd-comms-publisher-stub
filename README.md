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
