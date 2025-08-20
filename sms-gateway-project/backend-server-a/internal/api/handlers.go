package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	"sms-gateway/backend-server-a/internal/config"
	"sms-gateway/backend-server-a/internal/models"
	"sms-gateway/backend-server-a/internal/services"
)

func SendSMSHandler(cfg *config.Config, rdb *redis.Client, publisher *services.RabbitMQPublisher) gin.HandlerFunc {
	return func(c *gin.Context) {
		idKey := c.GetHeader("Idempotency-Key")
		if idKey != "" {
			if val, err := rdb.Get(c, "idem:"+idKey).Result(); err == nil {
				c.Data(http.StatusOK, "application/json", []byte(val))
				return
			}
		}

		var req SendSMSRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{Success: false, Message: err.Error()})
			return
		}

		trackingID := uuid.New().String()
		payload := models.MessagePayload{
			TrackingID: trackingID,
			Recipient:  req.Recipient,
			Message:    req.Message,
			Providers:  req.Providers,
			TTL:        req.TTL,
		}

		if err := publisher.Publish(c, payload); err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Success: false, Message: "failed to publish message"})
			return
		}

		resp := AcceptedResponse{Success: true, Message: "accepted", TrackingID: trackingID}

		if idKey != "" {
			if b, err := json.Marshal(resp); err == nil {
				rdb.Set(c, "idem:"+idKey, b, 24*time.Hour)
			}
		}

		c.JSON(http.StatusAccepted, resp)
	}
}
