# Backend Server A

Backend Server A provides the public HTTP API for the SMS Gateway project. Clients submit SMS requests here; the service enforces authentication, applies per-client quotas, and forwards messages to RabbitMQ for asynchronous processing.

## Features
- REST API built with [Gin](https://github.com/gin-gonic/gin)
- API key authentication via the `X-API-Key` header
- Daily quota tracking and idempotency storage using Redis
- Publishes accepted messages to RabbitMQ
- `GET /health` endpoint for simple health checks
- `POST /v1/sms/send` endpoint to queue an SMS message

## Configuration
Configuration is supplied through environment variables (for local development these can be placed in a `.env` file):

| Variable | Description |
| --- | --- |
| `LISTEN_ADDR` | Address for the HTTP server (e.g. `:8080`) |
| `REDIS_ADDR` | Redis server address |
| `REDIS_PASSWORD` | Redis password (optional) |
| `REDIS_DB` | Redis database index |
| `RABBITMQ_URL` | RabbitMQ connection URL |
| `RABBITMQ_QUEUE_NAME` | Queue name for outgoing messages |
| `CLIENT_CONFIG` | JSON mapping API keys to client information, e.g. `{\"my-api-key\":{\"name\":\"demo\",\"is_active\":true,\"daily_quota\":100}}` |

## Running Locally
1. Install Go 1.21 or later.
2. Set the environment variables listed above.
3. Run `go run ./cmd/api` to start the server, or build it with `go build -o backend-server-a ./cmd/api`.

## Docker Deployment
A multi-stage Dockerfile is provided. Build and run with:

```bash
docker build -t backend-server-a .
docker run --rm -p 8080:8080 --env-file .env backend-server-a
```

Ensure the `.env` file contains all configuration variables.
