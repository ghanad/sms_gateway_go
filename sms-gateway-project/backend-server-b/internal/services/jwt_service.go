package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTService handles JWT generation and validation.
type JWTService struct {
	secret  string
	revoked map[string]struct{}
}

// NewJWTService creates a new JWTService.
func NewJWTService(secret string) *JWTService {
	return &JWTService{secret: secret, revoked: make(map[string]struct{})}
}

// Claims defines the JWT payload structure.
type Claims struct {
	Username string `json:"username"`
	UserID   uint   `json:"user_id"`
	IsAdmin  bool   `json:"is_admin"`
	jwt.RegisteredClaims
}

// GenerateToken creates a signed JWT for the given user information.
func (j *JWTService) GenerateToken(username string, userID uint, isAdmin bool) (string, error) {
	claims := Claims{
		Username: username,
		UserID:   userID,
		IsAdmin:  isAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.secret))
}

// RevokeToken marks a token as invalid.
func (j *JWTService) RevokeToken(token string) {
	j.revoked[token] = struct{}{}
}

// ValidateToken parses and validates a JWT string.
func (j *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	if _, ok := j.revoked[tokenString]; ok {
		return nil, errors.New("token revoked")
	}
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(j.secret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
