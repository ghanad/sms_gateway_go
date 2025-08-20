package config

import (
    "testing"
)

func TestLoadConfigSuccess(t *testing.T) {
    t.Setenv("LISTEN_ADDR", ":8080")
    t.Setenv("REDIS_ADDR", "localhost:6379")
    t.Setenv("REDIS_PASSWORD", "secret")
    t.Setenv("REDIS_DB", "1")
    t.Setenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
    t.Setenv("RABBITMQ_QUEUE_NAME", "messages")
    t.Setenv("CLIENT_CONFIG", `{"key":{"name":"client","is_active":true,"daily_quota":5}}`)

    cfg, err := LoadConfig()
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if cfg.ListenAddr != ":8080" {
        t.Errorf("ListenAddr = %s", cfg.ListenAddr)
    }
    if cfg.RedisAddr != "localhost:6379" {
        t.Errorf("RedisAddr = %s", cfg.RedisAddr)
    }
    if cfg.RedisPassword != "secret" {
        t.Errorf("RedisPassword = %s", cfg.RedisPassword)
    }
    if cfg.RedisDB != 1 {
        t.Errorf("RedisDB = %d", cfg.RedisDB)
    }
    if cfg.RabbitMQURL != "amqp://guest:guest@localhost:5672/" {
        t.Errorf("RabbitMQURL = %s", cfg.RabbitMQURL)
    }
    if cfg.RabbitMQQueueName != "messages" {
        t.Errorf("RabbitMQQueueName = %s", cfg.RabbitMQQueueName)
    }
    client, ok := cfg.Clients["key"]
    if !ok {
        t.Fatalf("client not loaded")
    }
    if client.Name != "client" || !client.IsActive || client.DailyQuota != 5 {
        t.Errorf("client loaded incorrectly: %+v", client)
    }
}

func TestLoadConfigInvalidRedisDB(t *testing.T) {
    t.Setenv("REDIS_DB", "notanint")
    if _, err := LoadConfig(); err == nil {
        t.Fatal("expected error for invalid REDIS_DB")
    }
}

func TestLoadConfigInvalidClientConfig(t *testing.T) {
    t.Setenv("CLIENT_CONFIG", "{invalid")
    if _, err := LoadConfig(); err == nil {
        t.Fatal("expected error for invalid CLIENT_CONFIG")
    }
}

