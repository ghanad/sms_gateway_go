package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"sms-gateway/backend-server-a/internal/api"
	"sms-gateway/backend-server-a/internal/config"
	"sms-gateway/backend-server-a/internal/services"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	rdb := services.NewRedisClient(cfg)
	publisher, err := services.NewPublisher(cfg.RabbitMQURL, cfg.RabbitMQQueueName)
	if err != nil {
		log.Fatalf("rabbitmq: %v", err)
	}
	defer publisher.Close()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	v1 := r.Group("/v1")
	v1.Use(api.AuthMiddleware(cfg), api.QuotaMiddleware(rdb))
	v1.POST("/sms/send", api.SendSMSHandler(cfg, rdb, publisher))

	if err := r.Run(cfg.ListenAddr); err != nil {
		log.Fatal(err)
	}
}
