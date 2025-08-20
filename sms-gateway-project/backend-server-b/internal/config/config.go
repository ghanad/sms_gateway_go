package config

import (
	"encoding/json"
	"os"
	"strings" // Import the strings package

	"github.com/joho/godotenv"
)

// ProviderConfig holds external SMS provider settings.
type ProviderConfig struct {
	APIURL string `json:"api_url"`
	APIKey string `json:"api_key"`
}

// Config holds application configuration loaded from environment variables.
type Config struct {
	ListenAddr           string
	DatabaseURL          string
	RabbitMQURL          string
	RabbitMQQueueName    string
	Providers            map[string]ProviderConfig
	DefaultAdminUsername string
	DefaultAdminPassword string
	JWTSecretKey         string
	AllowedOrigins       []string // Changed to slice of strings
}

// LoadConfig loads configuration from environment variables and .env files.
func LoadConfig() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		ListenAddr:           os.Getenv("LISTEN_ADDR"),
		DatabaseURL:          os.Getenv("DATABASE_URL"),
		RabbitMQURL:          os.Getenv("RABBITMQ_URL"),
		RabbitMQQueueName:    os.Getenv("RABBITMQ_QUEUE_NAME"),
		Providers:            map[string]ProviderConfig{},
		DefaultAdminUsername: os.Getenv("DEFAULT_ADMIN_USERNAME"),
		DefaultAdminPassword: os.Getenv("DEFAULT_ADMIN_PASSWORD"),
		JWTSecretKey:         os.Getenv("JWT_SECRET_KEY"),
	}

	// Load and split AllowedOrigins
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		cfg.AllowedOrigins = strings.Split(origins, ",")
	}

	if data := os.Getenv("PROVIDERS_CONFIG"); data != "" {
		_ = json.Unmarshal([]byte(data), &cfg.Providers)
	}

	return cfg, nil
}
