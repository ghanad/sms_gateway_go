package repository

import (
	"sms-gateway/backend-server-b/internal/models"

	"gorm.io/gorm"
)

// ProviderRepository handles database operations for providers.
type ProviderRepository struct {
	DB *gorm.DB
}

// NewProviderRepository creates a new repository instance.
func NewProviderRepository(db *gorm.DB) *ProviderRepository {
	return &ProviderRepository{DB: db}
}

// Create inserts a new provider record.
func (r *ProviderRepository) Create(p *models.Provider) error {
	return r.DB.Create(p).Error
}

// Get fetches a provider by ID.
func (r *ProviderRepository) Get(id uint) (models.Provider, error) {
	var p models.Provider
	err := r.DB.First(&p, id).Error
	return p, err
}

// List returns all providers.
func (r *ProviderRepository) List() ([]models.Provider, error) {
	var items []models.Provider
	err := r.DB.Find(&items).Error
	return items, err
}

// Update saves provider changes.
func (r *ProviderRepository) Update(p *models.Provider) error {
	return r.DB.Save(p).Error
}

// Disable marks a provider as disabled.
func (r *ProviderRepository) Disable(id uint) error {
	return r.DB.Model(&models.Provider{}).Where("id = ?", id).Update("is_enabled", false).Error
}
