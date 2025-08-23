package models

import "time"

// Message represents an SMS message to be sent.
type Message struct {
	ID          uint   `gorm:"primaryKey"`
	TrackingID  string `gorm:"uniqueIndex"`
	Recipient   string
	Text        string
	Status      string
	ProviderRef string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Events      []MessageEvent
}

// MessageEvent stores a historical event for a message.
type MessageEvent struct {
	ID        uint    `gorm:"primaryKey"`
	MessageID uint    `gorm:"index"`
	Message   Message `gorm:"constraint:OnDelete:CASCADE"`
	Event     string
	CreatedAt time.Time
}

// UIUser represents a web panel user.
type UIUser struct {
	ID         uint   `gorm:"primaryKey"`
	Username   string `gorm:"unique"`
	Name       string
	Phone      string
	Extension  string
	Department string
	Password   string
	APIKey     string
	DailyQuota int
	IsActive   bool
	IsAdmin    bool
}
