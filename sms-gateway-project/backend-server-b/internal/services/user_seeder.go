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
	user, err := repo.GetUserByUsername(username)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		// user does not exist; create it
		hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user = models.UIUser{Username: username, Password: string(hashed), IsAdmin: true, IsActive: true}
		return repo.CreateUser(&user)
	}

	// user exists; ensure credentials and flags match configuration
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.Password = string(hashed)
	}
	if !user.IsAdmin {
		user.IsAdmin = true
	}
	if !user.IsActive {
		user.IsActive = true
	}
	return repo.UpdateUser(&user)
}
