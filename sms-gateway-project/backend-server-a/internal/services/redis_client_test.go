package services

import (
    "testing"

    "sms-gateway/backend-server-a/internal/config"
)

func TestNewRedisClient(t *testing.T) {
    cfg := &config.Config{
        RedisAddr:     "localhost:6379",
        RedisPassword: "pass",
        RedisDB:       3,
    }

    client := NewRedisClient(cfg)
    opts := client.Options()
    if opts.Addr != cfg.RedisAddr {
        t.Errorf("Addr = %s", opts.Addr)
    }
    if opts.Password != cfg.RedisPassword {
        t.Errorf("Password = %s", opts.Password)
    }
    if opts.DB != cfg.RedisDB {
        t.Errorf("DB = %d", opts.DB)
    }
}

