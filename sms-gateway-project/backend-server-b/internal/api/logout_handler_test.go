package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"sms-gateway/backend-server-b/internal/services"
)

func TestLogoutHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	jwtSvc := services.NewJWTService("secret")
	token, err := jwtSvc.GenerateToken("user", 1, false)
	if err != nil {
		t.Fatalf("could not generate token: %v", err)
	}
	h := NewHandlers(nil, nil, jwtSvc)
	r := gin.Default()
	r.POST("/api/auth/logout", h.LogoutHandler)

	req := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	// subsequent request with same token should be unauthorized
	req2 := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	req2.Header.Set("Authorization", "Bearer "+token)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", w2.Code)
	}
}
