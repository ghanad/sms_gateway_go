package providers

import (
	"github.com/google/uuid"
	"sms-gateway/backend-server-b/internal/config"
	"sms-gateway/backend-server-b/internal/models"
)

// ProviderAAdapter implements SmsProvider for Provider-A.
type ProviderAAdapter struct {
	cfg config.ProviderConfig
}

// NewProviderA creates a new ProviderAAdapter.
func NewProviderA(cfg config.ProviderConfig) *ProviderAAdapter {
	return &ProviderAAdapter{cfg: cfg}
}

// GetName returns the provider's name.
func (p *ProviderAAdapter) GetName() string { return "Provider-A" }

// Send sends an SMS message via Provider-A.
func (p *ProviderAAdapter) Send(message models.Message) (string, error) {
	return uuid.NewString(), nil
}
