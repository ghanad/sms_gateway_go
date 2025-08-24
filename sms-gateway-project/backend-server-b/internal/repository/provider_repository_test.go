package repository

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"sms-gateway/backend-server-b/internal/models"
)

func setupProviderRepo(t *testing.T) *ProviderRepository {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("db open: %v", err)
	}
	if err := db.AutoMigrate(&models.Provider{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	return NewProviderRepository(db)
}

func TestProviderRepositoryCRUD(t *testing.T) {
	repo := setupProviderRepo(t)

	p := models.Provider{Name: "test", Type: "t", BaseURL: "http://x", EndpointPath: "/send", AuthType: "none"}
	if err := repo.Create(&p); err != nil {
		t.Fatalf("create: %v", err)
	}
	if p.ID == 0 {
		t.Fatalf("expected ID assigned")
	}

	got, err := repo.Get(p.ID)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if got.Name != "test" {
		t.Fatalf("unexpected name %s", got.Name)
	}

	got.Name = "updated"
	if err := repo.Update(&got); err != nil {
		t.Fatalf("update: %v", err)
	}

	items, err := repo.List()
	if err != nil || len(items) != 1 || items[0].Name != "updated" {
		t.Fatalf("list: %v", err)
	}

	if err := repo.Disable(p.ID); err != nil {
		t.Fatalf("disable: %v", err)
	}
	after, _ := repo.Get(p.ID)
	if after.IsEnabled {
		t.Fatalf("expected disabled")
	}
}
