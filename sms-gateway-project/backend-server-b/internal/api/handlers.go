package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"sms-gateway/backend-server-b/internal/repository"
	"sms-gateway/backend-server-b/internal/services"
)

// Handlers bundles API handlers with required dependencies.
type Handlers struct {
	MessageRepo *repository.MessageRepository
	UserRepo    *repository.UserRepository
	JWTService  *services.JWTService
}

// NewHandlers creates a new Handlers instance.
func NewHandlers(msgRepo *repository.MessageRepository, userRepo *repository.UserRepository, jwtSvc *services.JWTService) *Handlers {
	return &Handlers{MessageRepo: msgRepo, UserRepo: userRepo, JWTService: jwtSvc}
}

// GetStatusHandler returns message status by tracking ID.
func (h *Handlers) GetStatusHandler(c *gin.Context) {
	trackingID := c.Param("tracking_id")
	msg, err := h.MessageRepo.GetMessageByTrackingID(trackingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, msg)
}

// DeliveryWebhookHandler handles delivery status callbacks from providers.
func (h *Handlers) DeliveryWebhookHandler(c *gin.Context) {
	provider := c.Param("provider")
	var payload struct {
		ProviderRef string `json:"provider_ref"`
		Status      string `json:"status"`
	}
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	msg, err := h.MessageRepo.FindMessageByProviderRef(payload.ProviderRef)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	status := "DELIVERED"
	if payload.Status != "delivered" {
		status = "FAILED_DELIVERY"
	}
	_ = h.MessageRepo.UpdateMessageStatus(msg.TrackingID, status, payload.ProviderRef)
	_ = h.MessageRepo.CreateMessageEvent(msg.TrackingID, "webhook from "+provider)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// LoginRequest represents credentials for login.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginHandler authenticates a user and returns a JWT token.
func (h *Handlers) LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	user, err := h.UserRepo.GetUserByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	token, err := h.JWTService.GenerateToken(user.Username, user.ID, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}
