package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"

	"sms-gateway/backend-server-a/internal/config"
)

func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		client, ok := cfg.Clients[apiKey]
		if !ok || !client.IsActive {
			c.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse{Success: false, Message: "invalid api key"})
			return
		}
		c.Set("client", client)
		c.Set("apiKey", apiKey)
		c.Next()
	}
}

func QuotaMiddleware(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientVal, exists := c.Get("client")
		if !exists {
			c.Next()
			return
		}
		client := clientVal.(config.ClientInfo)
		apiKey := c.GetString("apiKey")
		key := fmt.Sprintf("quota:%s:%s", apiKey, time.Now().Format("2006-01-02"))
		count, err := rdb.Incr(c, key).Result()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, ErrorResponse{Success: false, Message: "quota check failed"})
			return
		}
		if count == 1 {
			rdb.Expire(c, key, 24*time.Hour)
		}
		if int(count) > client.DailyQuota {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, ErrorResponse{Success: false, Message: "daily quota exceeded"})
			return
		}
		c.Next()
	}
}
