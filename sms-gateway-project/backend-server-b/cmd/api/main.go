package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"sms-gateway/backend-server-b/internal/api"
	"sms-gateway/backend-server-b/internal/config"
	"sms-gateway/backend-server-b/internal/database"
	"sms-gateway/backend-server-b/internal/providers"
	"sms-gateway/backend-server-b/internal/repository"
	"sms-gateway/backend-server-b/internal/services"
	"sms-gateway/backend-server-b/internal/worker"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	db, err := database.ConnectDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	if err := database.AutoMigrate(db); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	repo := repository.NewMessageRepository(db)

	provs := map[string]providers.SmsProvider{}
	for name, pcfg := range cfg.Providers {
		if p := providers.GetProvider(name, pcfg); p != nil {
			provs[name] = p
		}
	}

	engine := services.NewPolicyEngine(repo, provs)
	consumer := worker.NewConsumer(cfg.RabbitMQURL, cfg.RabbitMQQueueName, engine)
	if err := consumer.StartConsumer(); err != nil {
		log.Fatalf("consumer: %v", err)
	}

	handlers := api.NewHandlers(repo)
	r := gin.Default()
	r.GET("/api/status/:tracking_id", handlers.GetStatusHandler)
	r.POST("/webhooks/delivery-report/:provider", handlers.DeliveryWebhookHandler)

	if err := r.Run(cfg.ListenAddr); err != nil {
		log.Fatalf("server: %v", err)
	}
}
