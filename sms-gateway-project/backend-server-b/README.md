# Server B

Go service that consumes SMS jobs from RabbitMQ and manages provider configurations.

## Setup

Copy `.env.example` to `.env` and adjust values for your environment.

## Running

```bash
go run ./cmd/api
```

## Admin examples

Create provider:

```bash
curl -X POST http://localhost:8081/api/admin/providers \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"magfa-prod",
    "type":"magfa",
    "base_url":"https://sms.magfa.com",
    "endpoint_path":"/api/http/sms/v2/send",
    "auth_type":"basic",
    "basic_username":"YOUR_USERNAME/YOUR_DOMAIN",
    "basic_password":"YOUR_PASSWORD",
    "default_sender":"YOUR_SENDER",
    "is_enabled":true
  }'
```

## Testing

```bash
go test ./...
```
