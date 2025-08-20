Here’s your **Task List for Implementing `backend-server-a`** converted into clean, structured **Markdown**:

````markdown
# Task List for Implementing backend-server-a

## Target Technology Stack
- **Language**: Go (Golang)
- **Web Framework**: Gin
- **Redis Client**: go-redis
- **RabbitMQ Client**: amqp091-go
- **Configuration Manager**: godotenv
- **UUID Generator**: google/uuid

---

## Task 1: Project Initialization and Dependency Installation
**Goal**: Set up the Go project environment and add all necessary libraries.

**Actions**:
1. Navigate into the `backend-server-a` directory.
2. Initialize the Go module:
   ```bash
   go mod init sms-gateway/backend-server-a
````

3. Add dependencies:

   ```bash
   go get github.com/gin-gonic/gin
   go get github.com/redis/go-redis/v9
   go get github.com/rabbitmq/amqp091-go
   go get github.com/joho/godotenv
   go get github.com/google/uuid
   ```

---

## Task 2: Implement the Configuration Module

**Goal**: Load application settings from a `.env` file and environment variables.

**Actions**:

1. Create `.env.example` in project root:

   ```env
   # Server Configuration
   LISTEN_ADDR=":8080"

   # Redis Configuration
   REDIS_ADDR="localhost:6379"
   REDIS_PASSWORD=""
   REDIS_DB=0

   # RabbitMQ Configuration
   RABBITMQ_URL="amqp://guest:guest@localhost:5672/"
   RABBITMQ_QUEUE_NAME="sms_sending_queue"

   # Client Configuration (JSON string)
   CLIENT_CONFIG='{
     "api_key_for_service_A": {"name": "Financial Service", "is_active": true, "daily_quota": 1000},
     "api_key_for_service_B": {"name": "Notification Service", "is_active": true, "daily_quota": 5000}
   }'
   ```
2. In `internal/config/config.go`:

   * Define a `Config` struct.
   * Implement `LoadConfig()`:

     * Load `.env` with **godotenv**.
     * Read environment variables.
     * Parse `CLIENT_CONFIG` JSON into `map[string]ClientInfo`.

---

## Task 3: Define Data Models

**Goal**: Define Go structures for API input/output.

**Actions**:

1. Create `internal/api/models.go`.
2. Define:

   * `SendSMSRequest` (fields: recipient, message, providers, ttl).
   * `AcceptedResponse` (fields: success, message, tracking\_id).
   * `ErrorResponse`.
   * `MessagePayload` (for RabbitMQ).

---

## Task 4: Set Up the Base Web Server with Gin

**Goal**: Create a simple HTTP server.

**Actions**:

1. In `cmd/api/main.go`:

   * Load config via `config.LoadConfig()`.
   * Create Gin engine (`gin.Default()`).
   * Add `/health` endpoint returning `{ "status": "ok" }`.
   * Run server on configured address/port.

---

## Task 5: Implement Authentication Middleware

**Goal**: Protect endpoints with API key authentication.

**Actions**:

1. Create `internal/api/middleware.go`.
2. Implement `AuthMiddleware`:

   * Extract `X-API-Key` header.
   * Validate against `CLIENT_CONFIG`.
   * Check `is_active`.
   * On success: store client info in `gin.Context`.

---

## Task 6: Implement Quota Management Middleware

**Goal**: Enforce per-client daily quotas using Redis.

**Actions**:

1. Create `internal/services/redis_client.go` for Redis connection.
2. In `middleware.go`, add `QuotaMiddleware`:

   * Read client API key.
   * Build Redis key: `quota:<api_key>:YYYY-MM-DD`.
   * Use `INCR` and set 24h TTL.
   * Compare count with daily quota.
   * If exceeded → return `429 Too Many Requests`.

---

## Task 7: Implement Idempotency Logic

**Goal**: Prevent duplicate request processing.

**Actions**:

* In **SendSMSHandler**:

  * Check `Idempotency-Key` header.
  * If exists → check Redis for cached response.
  * If found → return cached response.
  * If not → process normally.
  * After success → cache response in Redis with 24h TTL.

---

## Task 8: Implement RabbitMQ Publisher Service

**Goal**: Publish validated messages to RabbitMQ.

**Actions**:

1. Create `internal/services/rabbitmq_publisher.go`.
2. Define `RabbitMQPublisher` struct.
3. Implement:

   * `NewPublisher()`: connect & declare queue.
   * `Publish()`: marshal `MessagePayload` → JSON, publish to queue.

---

## Task 9: Complete the Main Handler (Send SMS Handler)

**Goal**: Connect all components to handle SMS requests.

**Actions**:

1. In `internal/api/handlers.go`, implement `SendSMSHandler`:

   1. Execute idempotency check.
   2. Bind & validate request body.
   3. Generate `tracking_id` via `uuid.New()`.
   4. Construct `MessagePayload`.
   5. Call `RabbitMQPublisher.Publish()`.
   6. If success → return `202 Accepted` response with `tracking_id`.
   7. If `Idempotency-Key` present → cache response in Redis.

---

## Task 10: Connect All Components in main.go

**Goal**: Wire up services, routes, and middleware.

**Actions**:

1. In `cmd/api/main.go`:

   * Load config.
   * Initialize Redis client & RabbitMQ publisher.
   * Create `/v1` route group.
   * Apply `AuthMiddleware` + `QuotaMiddleware`.
   * Register `POST /sms/send` → `SendSMSHandler`.

---

## Task 11: Create a Dockerfile for Deployment

**Goal**: Build optimized Docker image.

**Actions**:

1. Create `Dockerfile`:

   ```dockerfile
   # Stage 1: Build
   FROM golang:1.21-alpine AS builder
   WORKDIR /app
   COPY . .
   RUN go build -o backend-server-a ./cmd/api

   # Stage 2: Final
   FROM alpine:latest
   WORKDIR /root/
   COPY --from=builder /app/backend-server-a .
   EXPOSE 8080
   CMD ["./backend-server-a"]
   ```

---

```

Would you like me to also generate a **ready-to-use folder structure (with stub files for each task)** so you can start coding immediately?
```
