package api

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/repository"
)

func TestUpdateUserHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("db open: %v", err)
	}
	if err := db.AutoMigrate(&models.UIUser{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	repo := repository.NewUserRepository(db)
	user := models.UIUser{Username: "user1", Name: "User One", Password: "pass", IsActive: true}
	if err := repo.CreateUser(&user); err != nil {
		t.Fatalf("create: %v", err)
	}

	h := NewHandlers(nil, repo, nil)
	r := gin.Default()
	r.PUT("/users/:id", h.UpdateUserHandler)

	payload := `{"username":"user1","name":"Updated","phone":"","extension":"","department":"","password":"","api_key":"","daily_quota":0,"is_admin":false,"is_active":true}`
	req := httptest.NewRequest(http.MethodPut, fmt.Sprintf("/users/%d", user.ID), strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}
	updated, err := repo.GetUserByID(user.ID)
	if err != nil {
		t.Fatalf("get: %v", err)
	}
	if updated.Name != "Updated" {
		t.Fatalf("expected name to be Updated, got %s", updated.Name)
	}
}
