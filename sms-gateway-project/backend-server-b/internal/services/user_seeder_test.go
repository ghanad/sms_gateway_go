package services

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/repository"
)

func TestSeedAdminUserUpdatesExisting(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("db open: %v", err)
	}
	if err := db.AutoMigrate(&models.UIUser{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	repo := repository.NewUserRepository(db)

	user := models.UIUser{Username: "admin", Password: "password", IsAdmin: false, IsActive: false}
	if err := repo.CreateUser(&user); err != nil {
		t.Fatalf("create: %v", err)
	}

	if err := SeedAdminUser(repo, "admin", "password"); err != nil {
		t.Fatalf("seed: %v", err)
	}

	updated, err := repo.GetUserByUsername("admin")
	if err != nil {
		t.Fatalf("get: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(updated.Password), []byte("password")); err != nil {
		t.Errorf("expected password to be hashed and match: %v", err)
	}
	if !updated.IsAdmin || !updated.IsActive {
		t.Errorf("expected user to be admin and active")
	}
}
