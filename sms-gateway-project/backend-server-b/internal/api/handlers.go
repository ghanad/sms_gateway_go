package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"sms-gateway/backend-server-b/internal/repository"
)

// Handlers bundles API handlers with required dependencies.
type Handlers struct {
	Repo *repository.MessageRepository
}

// NewHandlers creates a new Handlers instance.
func NewHandlers(repo *repository.MessageRepository) *Handlers {
	return &Handlers{Repo: repo}
}

// GetStatusHandler returns message status by tracking ID.
func (h *Handlers) GetStatusHandler(c *gin.Context) {
	trackingID := c.Param("tracking_id")
	msg, err := h.Repo.GetMessageByTrackingID(trackingID)
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
	msg, err := h.Repo.FindMessageByProviderRef(payload.ProviderRef)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	status := "DELIVERED"
	if payload.Status != "delivered" {
		status = "FAILED_DELIVERY"
	}
	_ = h.Repo.UpdateMessageStatus(msg.TrackingID, status, payload.ProviderRef)
	_ = h.Repo.CreateMessageEvent(msg.TrackingID, "webhook from "+provider)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
