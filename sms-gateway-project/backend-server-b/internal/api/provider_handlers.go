package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"sms-gateway/backend-server-b/internal/models"
)

// ProviderRequest captures provider fields from requests.
type ProviderRequest struct {
	Name          string `json:"name"`
	Type          string `json:"type"`
	BaseURL       string `json:"base_url"`
	EndpointPath  string `json:"endpoint_path"`
	AuthType      string `json:"auth_type"`
	BasicUsername string `json:"basic_username"`
	BasicPassword string `json:"basic_password"`
	APIKey        string `json:"api_key"`
	DefaultSender string `json:"default_sender"`
	Priority      int    `json:"priority"`
	IsEnabled     *bool  `json:"is_enabled"`
}

// CreateProviderHandler handles POST /api/admin/providers.
func (h *Handlers) CreateProviderHandler(c *gin.Context) {
	var req ProviderRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	p := models.Provider{
		Name:          req.Name,
		Type:          req.Type,
		BaseURL:       req.BaseURL,
		EndpointPath:  req.EndpointPath,
		AuthType:      req.AuthType,
		BasicUsername: req.BasicUsername,
		BasicPassword: req.BasicPassword,
		APIKey:        req.APIKey,
		DefaultSender: req.DefaultSender,
		Priority:      req.Priority,
	}
	if req.IsEnabled != nil {
		p.IsEnabled = *req.IsEnabled
	}
	if err := h.ProviderSvc.Create(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

// ListProvidersHandler handles GET /api/admin/providers.
func (h *Handlers) ListProvidersHandler(c *gin.Context) {
	items, err := h.ProviderSvc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list providers"})
		return
	}
	c.JSON(http.StatusOK, items)
}

// GetProviderHandler handles GET /api/admin/providers/:id.
func (h *Handlers) GetProviderHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	p, err := h.ProviderSvc.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

// UpdateProviderHandler handles PATCH /api/admin/providers/:id.
func (h *Handlers) UpdateProviderHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req ProviderRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	p, err := h.ProviderSvc.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if req.Name != "" {
		p.Name = req.Name
	}
	if req.Type != "" {
		p.Type = req.Type
	}
	if req.BaseURL != "" {
		p.BaseURL = req.BaseURL
	}
	if req.EndpointPath != "" {
		p.EndpointPath = req.EndpointPath
	}
	if req.AuthType != "" {
		p.AuthType = req.AuthType
	}
	if req.BasicUsername != "" {
		p.BasicUsername = req.BasicUsername
	}
	if req.BasicPassword != "" {
		p.BasicPassword = req.BasicPassword
	}
	if req.APIKey != "" {
		p.APIKey = req.APIKey
	}
	if req.DefaultSender != "" {
		p.DefaultSender = req.DefaultSender
	}
	if req.Priority != 0 {
		p.Priority = req.Priority
	}
	if req.IsEnabled != nil {
		p.IsEnabled = *req.IsEnabled
	}
	if err := h.ProviderSvc.Update(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update provider"})
		return
	}
	c.JSON(http.StatusOK, p)
}

// DeleteProviderHandler handles DELETE /api/admin/providers/:id.
func (h *Handlers) DeleteProviderHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.ProviderSvc.Disable(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete provider"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "disabled"})
}

// TestProviderHandler handles POST /api/admin/providers/:id/test.
func (h *Handlers) TestProviderHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	p, err := h.ProviderSvc.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := h.ProviderSvc.TestConnection(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
