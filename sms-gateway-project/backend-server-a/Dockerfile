# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache git && \
    go mod tidy && \
    go build -o backend-server-a ./cmd/api

# Stage 2: Final
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/backend-server-a .
EXPOSE 8080
CMD ["./backend-server-a"]
