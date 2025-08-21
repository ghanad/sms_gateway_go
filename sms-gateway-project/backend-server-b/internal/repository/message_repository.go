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

// DashboardStats represents summary statistics for the dashboard.

type DashboardStats struct {
	Total     int64 `json:"total"`
	Sent      int64 `json:"sent"`
	Delivered int64 `json:"delivered"`
	Failed    int64 `json:"failed"`
}

// GetDashboardStats calculates and returns dashboard statistics.

func (r *MessageRepository) GetDashboardStats() (DashboardStats, error) {
	var stats DashboardStats

	// Total messages
	if err := r.DB.Model(&models.Message{}).Count(&stats.Total).Error; err != nil {
		return stats, err
	}

	// Sent messages (you might need to adjust the status values based on your application logic)
	if err := r.DB.Model(&models.Message{}).Where("status = ?", "SENT").Count(&stats.Sent).Error; err != nil {
		return stats, err
	}

	// Delivered messages
	if err := r.DB.Model(&models.Message{}).Where("status = ?", "DELIVERED").Count(&stats.Delivered).Error; err != nil {
		return stats, err
	}

	// Failed messages
	if err := r.DB.Model(&models.Message{}).Where("status LIKE ?", "FAILED%").Count(&stats.Failed).Error; err != nil {
		return stats, err
	}

	return stats, nil
}

func (r *MessageRepository) GetMessages(limit, offset int) ([]models.Message, int64, error) {
	var messages []models.Message
	var total int64

	r.DB.Model(&models.Message{}).Count(&total)

	err := r.DB.Order("created_at desc").Limit(limit).Offset(offset).Find(&messages).Error

	return messages, total, err
}
