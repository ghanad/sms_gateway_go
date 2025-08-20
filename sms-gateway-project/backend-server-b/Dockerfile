# Stage 1: build
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod .
COPY internal ./internal
COPY cmd ./cmd
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o sms-server ./cmd/api

# Stage 2: final image
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/sms-server .
COPY .env.example .
EXPOSE 8081
CMD ["./sms-server"]
