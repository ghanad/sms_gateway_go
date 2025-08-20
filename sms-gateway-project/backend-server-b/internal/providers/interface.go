package providers

import "sms-gateway/backend-server-b/internal/models"

// SmsProvider defines an interface for sending SMS messages.
type SmsProvider interface {
	Send(message models.Message) (string, error)
	GetName() string
}
