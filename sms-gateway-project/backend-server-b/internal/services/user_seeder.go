package services

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/repository"
)

// SeedAdminUser ensures a default admin user exists.
func SeedAdminUser(repo *repository.UserRepository, username, password string) error {
	if username == "" || password == "" {
		return nil
	}
	_, err := repo.GetUserByUsername(username)
	if err == nil {
		return nil // user already exists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user := models.UIUser{Username: username, Password: string(hashed), IsAdmin: true, IsActive: true}
	return repo.CreateUser(&user)
}
