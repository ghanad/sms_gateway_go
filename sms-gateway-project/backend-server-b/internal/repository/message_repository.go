package repository

import (
	"sms-gateway/backend-server-b/internal/models"

	"gorm.io/gorm"
)

// MessageRepository provides database operations for messages.
type MessageRepository struct {
	DB *gorm.DB
}

// NewMessageRepository creates a new repository instance.
func NewMessageRepository(db *gorm.DB) *MessageRepository {
	return &MessageRepository{DB: db}
}

// CreateInitialMessage inserts a new message with QUEUED status.
func (r *MessageRepository) CreateInitialMessage(trackingID, recipient, text string) error {
	msg := models.Message{TrackingID: trackingID, Recipient: recipient, Text: text, Status: "QUEUED"}
	return r.DB.Create(&msg).Error
}

// UpdateMessageStatus updates the status and provider reference of a message.
func (r *MessageRepository) UpdateMessageStatus(trackingID, newStatus, providerRef string) error {
	return r.DB.Model(&models.Message{}).Where("tracking_id = ?", trackingID).Updates(map[string]any{
		"status":       newStatus,
		"provider_ref": providerRef,
	}).Error
}

// GetMessageByTrackingID retrieves a message and its events.
func (r *MessageRepository) GetMessageByTrackingID(trackingID string) (models.Message, error) {
	var msg models.Message
	err := r.DB.Preload("Events").Where("tracking_id = ?", trackingID).First(&msg).Error
	return msg, err
}

// FindMessageByProviderRef finds a message by provider reference.
func (r *MessageRepository) FindMessageByProviderRef(ref string) (models.Message, error) {
	var msg models.Message
	err := r.DB.Where("provider_ref = ?", ref).First(&msg).Error
	return msg, err
}

// CreateMessageEvent adds a new event to the message history.
func (r *MessageRepository) CreateMessageEvent(trackingID, description string) error {
	msg, err := r.GetMessageByTrackingID(trackingID)
	if err != nil {
		return err
	}
	event := models.MessageEvent{MessageID: msg.ID, Event: description}
	return r.DB.Create(&event).Error
}
