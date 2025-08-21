package api

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"sms-gateway/backend-server-b/internal/models"
	"sms-gateway/backend-server-b/internal/repository"
	"sms-gateway/backend-server-b/internal/services"
)

// Handlers bundles API handlers with required dependencies.
type Handlers struct {
	MessageRepo *repository.MessageRepository
	UserRepo    *repository.UserRepository
	JWTService  *services.JWTService
}

// NewHandlers creates a new Handlers instance.
func NewHandlers(msgRepo *repository.MessageRepository, userRepo *repository.UserRepository, jwtSvc *services.JWTService) *Handlers {
	return &Handlers{MessageRepo: msgRepo, UserRepo: userRepo, JWTService: jwtSvc}
}

// GetStatusHandler returns message status by tracking ID.
func (h *Handlers) GetStatusHandler(c *gin.Context) {
	trackingID := c.Param("tracking_id")
	msg, err := h.MessageRepo.GetMessageByTrackingID(trackingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, msg)
}

// DeliveryWebhookHandler handles delivery status callbacks from providers.
func (h *Handlers) DeliveryWebhookHandler(c *gin.Context) {
	provider := c.Param("provider")
	var payload struct {
		ProviderRef string `json:"provider_ref"`
		Status      string `json:"status"`
	}
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	msg, err := h.MessageRepo.FindMessageByProviderRef(payload.ProviderRef)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	status := "DELIVERED"
	if payload.Status != "delivered" {
		status = "FAILED_DELIVERY"
	}
	_ = h.MessageRepo.UpdateMessageStatus(msg.TrackingID, status, payload.ProviderRef)
	_ = h.MessageRepo.CreateMessageEvent(msg.TrackingID, "webhook from "+provider)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// LoginRequest represents credentials for login.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginHandler authenticates a user and returns a JWT token.
func (h *Handlers) LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	user, err := h.UserRepo.GetUserByUsername(req.Username)
	if err != nil || !user.IsActive {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	token, err := h.JWTService.GenerateToken(user.Username, user.ID, user.IsAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

// LogoutHandler revokes the provided JWT token.
func (h *Handlers) LogoutHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}
	tokenString := parts[1]
	if _, err := h.JWTService.ValidateToken(tokenString); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}
	h.JWTService.RevokeToken(tokenString)
	c.JSON(http.StatusOK, gin.H{"status": "logged out"})
}

func (h *Handlers) GetDashboardStatsHandler(c *gin.Context) {
	stats, err := h.MessageRepo.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get stats"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *Handlers) GetMessagesHandler(c *gin.Context) {
	limit := c.DefaultQuery("limit", "10")
	offset := c.DefaultQuery("offset", "0")

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit"})
		return
	}

	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid offset"})
		return
	}

	messages, total, err := h.MessageRepo.GetMessages(limitInt, offsetInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": messages,
		"total": total,
	})
}

// UserRequest represents the payload for creating a user.
type UserRequest struct {
        Username   string `json:"username"`
        Name       string `json:"name"`
        Phone      string `json:"phone"`
        Extension  string `json:"extension"`
        Department string `json:"department"`
        Password   string `json:"password"`
        APIKey     string `json:"api_key"`
        DailyQuota int    `json:"daily_quota"`
        IsAdmin    bool   `json:"is_admin"`
        IsActive   bool   `json:"is_active"`
}

// CreateUserHandler adds a new user.
func (h *Handlers) CreateUserHandler(c *gin.Context) {
	var req UserRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not hash password"})
		return
	}
	user := models.UIUser{
		Username:   req.Username,
		Name:       req.Name,
		Phone:      req.Phone,
		Extension:  req.Extension,
                Department: req.Department,
                Password:   string(hashed),
                APIKey:     req.APIKey,
                DailyQuota: req.DailyQuota,
                IsAdmin:    req.IsAdmin,
                IsActive:   req.IsActive,
        }
	if err := h.UserRepo.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": user.ID})
}

// ListUsersHandler returns all users.
func (h *Handlers) ListUsersHandler(c *gin.Context) {
	users, err := h.UserRepo.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not list users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// DeleteUserHandler removes a user by ID.
func (h *Handlers) DeleteUserHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.UserRepo.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

// ActivateUserHandler sets a user's active status to true.
func (h *Handlers) ActivateUserHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.UserRepo.SetActive(uint(id), true); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not activate user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "activated"})
}

// DeactivateUserHandler sets a user's active status to false.
func (h *Handlers) DeactivateUserHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.UserRepo.SetActive(uint(id), false); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not deactivate user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "deactivated"})
}
