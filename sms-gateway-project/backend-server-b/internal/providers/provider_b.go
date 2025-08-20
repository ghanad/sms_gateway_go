package providers

import (
	"github.com/google/uuid"
	"sms-gateway/backend-server-b/internal/config"
	"sms-gateway/backend-server-b/internal/models"
)

// ProviderBAdapter implements SmsProvider for Provider-B.
type ProviderBAdapter struct {
	cfg config.ProviderConfig
}

// NewProviderB creates a new ProviderBAdapter.
func NewProviderB(cfg config.ProviderConfig) *ProviderBAdapter {
	return &ProviderBAdapter{cfg: cfg}
}

// GetName returns the provider's name.
func (p *ProviderBAdapter) GetName() string { return "Provider-B" }

// Send sends an SMS message via Provider-B.
func (p *ProviderBAdapter) Send(message models.Message) (string, error) {
	return uuid.NewString(), nil
}
