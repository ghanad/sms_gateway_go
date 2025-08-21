package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"sms-gateway/backend-server-b/internal/services"
)

func TestAdminOnlyMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	jwtSvc := services.NewJWTService("secret")
	adminToken, _ := jwtSvc.GenerateToken("admin", 1, true)
	userToken, _ := jwtSvc.GenerateToken("user", 2, false)

	r := gin.Default()
	r.GET("/admin", AuthMiddleware(jwtSvc), AdminOnlyMiddleware(), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// non-admin should be forbidden
	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	req.Header.Set("Authorization", "Bearer "+userToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusForbidden {
		t.Fatalf("expected status 403, got %d", w.Code)
	}

	// admin should pass
	req2 := httptest.NewRequest(http.MethodGet, "/admin", nil)
	req2.Header.Set("Authorization", "Bearer "+adminToken)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w2.Code)
	}
}
