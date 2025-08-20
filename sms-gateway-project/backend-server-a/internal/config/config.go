package config

import (
	"encoding/json"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type ClientInfo struct {
	Name       string `json:"name"`
	IsActive   bool   `json:"is_active"`
	DailyQuota int    `json:"daily_quota"`
}

type Config struct {
	ListenAddr        string
	RedisAddr         string
	RedisPassword     string
	RedisDB           int
	RabbitMQURL       string
	RabbitMQQueueName string
	Clients           map[string]ClientInfo
}

func LoadConfig() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{}
	cfg.ListenAddr = os.Getenv("LISTEN_ADDR")
	cfg.RedisAddr = os.Getenv("REDIS_ADDR")
	cfg.RedisPassword = os.Getenv("REDIS_PASSWORD")
	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		if db, err := strconv.Atoi(dbStr); err == nil {
			cfg.RedisDB = db
		} else {
			return nil, err
		}
	}
	cfg.RabbitMQURL = os.Getenv("RABBITMQ_URL")
	cfg.RabbitMQQueueName = os.Getenv("RABBITMQ_QUEUE_NAME")

	cfg.Clients = make(map[string]ClientInfo)
	if cc := os.Getenv("CLIENT_CONFIG"); cc != "" {
		if err := json.Unmarshal([]byte(cc), &cfg.Clients); err != nil {
			return nil, err
		}
	}

	return cfg, nil
}
