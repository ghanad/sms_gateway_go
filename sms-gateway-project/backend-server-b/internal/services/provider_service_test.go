package services

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/repository"
)

func setupProviderService(t *testing.T) *ProviderService {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("db open: %v", err)
	}
	if err := db.AutoMigrate(&models.Provider{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	repo := repository.NewProviderRepository(db)
	return NewProviderService(repo)
}

func TestProviderServiceCreateAndDisable(t *testing.T) {
	svc := setupProviderService(t)
	p := models.Provider{Name: "svc", Type: "t", BaseURL: "http://x", EndpointPath: "/send", AuthType: "none"}
	if err := svc.Create(&p); err != nil {
		t.Fatalf("create: %v", err)
	}
	if p.ID == 0 {
		t.Fatalf("expected ID assigned")
	}
	if err := svc.Disable(p.ID); err != nil {
		t.Fatalf("disable: %v", err)
	}
	got, err := svc.Get(p.ID)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got.IsEnabled {
		t.Fatalf("expected disabled")
	}
}
