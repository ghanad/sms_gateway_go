package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/repository"
	"sms-gateway/backend-server-b/internal/services"
)

func setupProviderAPI(t *testing.T) (*gin.Engine, *services.JWTService) {
	gin.SetMode(gin.TestMode)
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("db open: %v", err)
	}
	if err := db.AutoMigrate(&models.Provider{}); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	repo := repository.NewProviderRepository(db)
	svc := services.NewProviderService(repo)
	jwtSvc := services.NewJWTService("secret")
	h := NewHandlers(nil, nil, svc, jwtSvc)
	r := gin.Default()
	admin := r.Group("/api/admin")
	admin.Use(AuthMiddleware(jwtSvc), AdminOnlyMiddleware())
	prov := admin.Group("/providers")
	prov.POST("", h.CreateProviderHandler)
	prov.GET("", h.ListProvidersHandler)
	return r, jwtSvc
}

func TestCreateProviderHandler(t *testing.T) {
	r, jwtSvc := setupProviderAPI(t)
	token, _ := jwtSvc.GenerateToken("admin", 1, true)
	body := `{"name":"p1","type":"t","base_url":"http://x","endpoint_path":"/send","auth_type":"none"}`
	req := httptest.NewRequest(http.MethodPost, "/api/admin/providers", strings.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", w.Code)
	}
}

func TestListProvidersHandler(t *testing.T) {
	r, jwtSvc := setupProviderAPI(t)
	token, _ := jwtSvc.GenerateToken("admin", 1, true)
	body := `{"name":"p1","type":"t","base_url":"http://x","endpoint_path":"/send","auth_type":"none"}`
	req := httptest.NewRequest(http.MethodPost, "/api/admin/providers", strings.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("create expected 201, got %d", w.Code)
	}
	req2 := httptest.NewRequest(http.MethodGet, "/api/admin/providers", nil)
	req2.Header.Set("Authorization", "Bearer "+token)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w2.Code)
	}
}
