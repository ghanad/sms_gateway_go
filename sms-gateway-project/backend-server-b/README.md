# Server B

Node.js service that consumes SMS jobs from RabbitMQ and sends via configured providers.

## Setup

```bash
npm install
npm run build
```

Copy `.env.example` to `.env` and adjust values.

## Running

```bash
npm start
```

## Admin examples

Create provider:

```bash
curl -X POST http://localhost:8080/api/v1/admin/providers \
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
npm test
```
