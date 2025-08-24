package services

import (
	"errors"

	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/repository"
)

// ProviderService contains business logic for providers.
type ProviderService struct {
	Repo *repository.ProviderRepository
}

// NewProviderService creates a new ProviderService.
func NewProviderService(repo *repository.ProviderRepository) *ProviderService {
	return &ProviderService{Repo: repo}
}

// Create creates a provider after basic validation.
func (s *ProviderService) Create(p *models.Provider) error {
	if p.Name == "" || p.Type == "" || p.BaseURL == "" || p.EndpointPath == "" || p.AuthType == "" {
		return errors.New("missing required fields")
	}
	return s.Repo.Create(p)
}

// List returns all providers.
func (s *ProviderService) List() ([]models.Provider, error) {
	return s.Repo.List()
}

// Get returns provider by ID.
func (s *ProviderService) Get(id uint) (models.Provider, error) {
	return s.Repo.Get(id)
}

// Update updates a provider.
func (s *ProviderService) Update(p *models.Provider) error {
	return s.Repo.Update(p)
}

// Disable disables a provider.
func (s *ProviderService) Disable(id uint) error {
	return s.Repo.Disable(id)
}

// TestConnection is a stub for credential checks.
func (s *ProviderService) TestConnection(p *models.Provider) error {
	// In a real implementation this would attempt a connection.
	return nil
}
