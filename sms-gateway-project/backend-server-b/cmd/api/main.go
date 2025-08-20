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

	msgRepo := repository.NewMessageRepository(db)
	userRepo := repository.NewUserRepository(db)

	if err := services.SeedAdminUser(userRepo, cfg.DefaultAdminUsername, cfg.DefaultAdminPassword); err != nil {
		log.Fatalf("seed admin: %v", err)
	}

	jwtSvc := services.NewJWTService(cfg.JWTSecretKey)

	provs := map[string]providers.SmsProvider{}
	for name, pcfg := range cfg.Providers {
		if p := providers.GetProvider(name, pcfg); p != nil {
			provs[name] = p
		}
	}

	engine := services.NewPolicyEngine(msgRepo, provs)
	consumer := worker.NewConsumer(cfg.RabbitMQURL, cfg.RabbitMQQueueName, engine)
	if err := consumer.StartConsumer(); err != nil {
		log.Fatalf("consumer: %v", err)
	}

	handlers := api.NewHandlers(msgRepo, userRepo, jwtSvc)
	r := gin.Default()

	authRoutes := r.Group("/api/auth")
	authRoutes.POST("/login", handlers.LoginHandler)

	apiRoutes := r.Group("/api")
	apiRoutes.Use(api.AuthMiddleware(jwtSvc))
	apiRoutes.GET("/status/:tracking_id", handlers.GetStatusHandler)
	apiRoutes.POST("/webhooks/delivery-report/:provider", handlers.DeliveryWebhookHandler)

	if err := r.Run(cfg.ListenAddr); err != nil {
		log.Fatalf("server: %v", err)
	}
}
