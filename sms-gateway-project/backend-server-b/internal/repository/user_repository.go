package repository

import (
	"sms-gateway/backend-server-b/internal/models"

	"gorm.io/gorm"
)

// UserRepository provides database operations for UI users.
type UserRepository struct {
	DB *gorm.DB
}

// NewUserRepository creates a new repository instance for users.
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{DB: db}
}

// GetUserByUsername retrieves a user by username.
func (r *UserRepository) GetUserByUsername(username string) (models.UIUser, error) {
	var user models.UIUser
	err := r.DB.Where("username = ?", username).First(&user).Error
	return user, err
}

// CreateUser inserts a new user record.
func (r *UserRepository) CreateUser(user *models.UIUser) error {
	return r.DB.Create(user).Error
}
