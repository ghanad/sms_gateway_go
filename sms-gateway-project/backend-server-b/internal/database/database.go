package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"sms-gateway/backend-server-b/internal/models"
)

// ConnectDatabase initializes a GORM database connection using the given DSN.
func ConnectDatabase(dsn string) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

// AutoMigrate runs GORM auto-migrations for all models.
func AutoMigrate(db *gorm.DB) error {
        return db.AutoMigrate(&models.Message{}, &models.MessageEvent{}, &models.UIUser{})
}
