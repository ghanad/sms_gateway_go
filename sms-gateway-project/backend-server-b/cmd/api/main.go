package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"sms-gateway/backend-server-b/internal/api"
	"sms-gateway/backend-server-b/internal/config"
	"sms-gateway/backend-server-b/internal/database"
	"sms-gateway/backend-server-b/internal/providers"
	"sms-gateway/backend-server-b/internal/repository"
	"sms-gateway/backend-server-b/internal/services"
	"sms-gateway/backend-server-b/internal/worker"
	"time"
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

	// Configure CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins, // Use configured allowed origins (now a slice)
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	authRoutes := r.Group("/api/auth")
	authRoutes.POST("/login", handlers.LoginHandler)
	authRoutes.POST("/logout", handlers.LogoutHandler)

	apiRoutes := r.Group("/api")
	apiRoutes.Use(api.AuthMiddleware(jwtSvc))
	apiRoutes.GET("/dashboard", handlers.GetDashboardStatsHandler)
	apiRoutes.GET("/messages", handlers.GetMessagesHandler)
	apiRoutes.GET("/status/:tracking_id", handlers.GetStatusHandler)
	apiRoutes.POST("/webhooks/delivery-report/:provider", handlers.DeliveryWebhookHandler)

	userRoutes := apiRoutes.Group("/users")
	userRoutes.Use(api.AdminOnlyMiddleware())
	userRoutes.GET("", handlers.ListUsersHandler)
	userRoutes.POST("", handlers.CreateUserHandler)
	userRoutes.PUT(":id", handlers.UpdateUserHandler)
	userRoutes.DELETE(":id", handlers.DeleteUserHandler)
	userRoutes.POST(":id/activate", handlers.ActivateUserHandler)
	userRoutes.POST(":id/deactivate", handlers.DeactivateUserHandler)

	if err := r.Run(cfg.ListenAddr); err != nil {
		log.Fatalf("server: %v", err)
	}
}
