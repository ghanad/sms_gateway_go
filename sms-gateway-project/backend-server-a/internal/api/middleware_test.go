package api

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"

    "sms-gateway/backend-server-a/internal/config"
)

func TestAuthMiddleware(t *testing.T) {
    gin.SetMode(gin.TestMode)

    cfg := &config.Config{
        Clients: map[string]config.ClientInfo{
            "good":     {Name: "good", IsActive: true, DailyQuota: 10},
            "inactive": {Name: "inactive", IsActive: false, DailyQuota: 10},
        },
    }

    router := gin.New()
    router.Use(AuthMiddleware(cfg))
    router.GET("/test", func(c *gin.Context) {
        if _, exists := c.Get("client"); !exists {
            t.Error("client not set")
        }
        c.Status(http.StatusOK)
    })

    req, _ := http.NewRequest(http.MethodGet, "/test", nil)
    req.Header.Set("X-API-Key", "good")
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    if w.Code != http.StatusOK {
        t.Fatalf("expected 200 got %d", w.Code)
    }

    req, _ = http.NewRequest(http.MethodGet, "/test", nil)
    req.Header.Set("X-API-Key", "bad")
    w = httptest.NewRecorder()
    router.ServeHTTP(w, req)
    if w.Code != http.StatusUnauthorized {
        t.Fatalf("expected 401 got %d", w.Code)
    }

    req, _ = http.NewRequest(http.MethodGet, "/test", nil)
    req.Header.Set("X-API-Key", "inactive")
    w = httptest.NewRecorder()
    router.ServeHTTP(w, req)
    if w.Code != http.StatusUnauthorized {
        t.Fatalf("expected 401 got %d", w.Code)
    }
}

