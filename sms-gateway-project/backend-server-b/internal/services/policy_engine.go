package services

import (
	"fmt"

	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/providers"
	"sms-gateway/backend-server-b/internal/repository"
)

// MessagePayload represents the payload consumed from RabbitMQ.
type MessagePayload struct {
	TrackingID string   `json:"tracking_id"`
	Recipient  string   `json:"recipient"`
	Text       string   `json:"text"`
	Providers  []string `json:"providers"`
}

// PolicyEngine orchestrates provider selection and sending logic.
type PolicyEngine struct {
	Repo      *repository.MessageRepository
	Providers map[string]providers.SmsProvider
}

// NewPolicyEngine creates a new PolicyEngine instance.
func NewPolicyEngine(repo *repository.MessageRepository, provs map[string]providers.SmsProvider) *PolicyEngine {
	return &PolicyEngine{Repo: repo, Providers: provs}
}

// ProcessMessage processes an incoming message payload.
func (p *PolicyEngine) ProcessMessage(payload MessagePayload) error {
	if err := p.Repo.UpdateMessageStatus(payload.TrackingID, "PROCESSING", ""); err != nil {
		return err
	}

	provs := payload.Providers
	if len(provs) == 0 {
		for name := range p.Providers {
			provs = []string{name}
			break
		}
	}

	for _, name := range provs {
		prov := p.Providers[name]
		if prov == nil {
			continue
		}
		msg := models.Message{
			TrackingID: payload.TrackingID,
			Recipient:  payload.Recipient,
			Text:       payload.Text,
		}
		if ref, err := prov.Send(msg); err == nil {
			_ = p.Repo.UpdateMessageStatus(payload.TrackingID, "SENT", ref)
			_ = p.Repo.CreateMessageEvent(payload.TrackingID, fmt.Sprintf("sent via %s", name))
			return nil
		}
	}

	_ = p.Repo.UpdateMessageStatus(payload.TrackingID, "FAILED", "")
	_ = p.Repo.CreateMessageEvent(payload.TrackingID, "all providers failed")
	return fmt.Errorf("all providers failed")
}
