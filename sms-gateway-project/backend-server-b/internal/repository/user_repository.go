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

// GetAllUsers retrieves all users.
func (r *UserRepository) GetAllUsers() ([]models.UIUser, error) {
	var users []models.UIUser
	err := r.DB.Find(&users).Error
	return users, err
}

// DeleteUser removes a user by ID.
func (r *UserRepository) DeleteUser(id uint) error {
	return r.DB.Delete(&models.UIUser{}, id).Error
}

// SetActive updates the active status of a user.
func (r *UserRepository) SetActive(id uint, active bool) error {
	return r.DB.Model(&models.UIUser{}).Where("id = ?", id).Update("is_active", active).Error
}

// GetUserByID retrieves a user by ID.
func (r *UserRepository) GetUserByID(id uint) (models.UIUser, error) {
	var user models.UIUser
	err := r.DB.First(&user, id).Error
	return user, err
}

// UpdateUser updates an existing user record.
func (r *UserRepository) UpdateUser(user *models.UIUser) error {
	return r.DB.Save(user).Error
}
