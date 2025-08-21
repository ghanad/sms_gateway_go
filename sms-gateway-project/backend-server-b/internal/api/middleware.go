package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"sms-gateway/backend-server-b/internal/services"
)

// AuthMiddleware validates JWT tokens from the Authorization header.
func AuthMiddleware(jwtSvc *services.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header missing or invalid"})
			return
		}
		claims, err := jwtSvc.ValidateToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("username", claims.Username)
		c.Set("userID", claims.UserID)
		c.Set("isAdmin", claims.IsAdmin)
		c.Next()
	}
}

// AdminOnlyMiddleware ensures the requester has admin privileges.
func AdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isAdmin, ok := c.Get("isAdmin")
		if !ok || !isAdmin.(bool) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			return
		}
		c.Next()
	}
}
