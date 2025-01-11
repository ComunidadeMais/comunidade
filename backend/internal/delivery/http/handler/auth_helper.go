package handler

import (
	"fmt"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/golang-jwt/jwt/v5"
)

func (h *Handler) generateToken(user *domain.User) (string, error) {
	// Cria o token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	})

	// Assina o token com a chave secreta
	tokenString, err := token.SignedString([]byte("your-secret-key")) // TODO: Usar chave do config
	if err != nil {
		return "", fmt.Errorf("erro ao assinar token: %v", err)
	}

	return tokenString, nil
}
