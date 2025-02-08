package handler

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/config"
	"github.com/comunidade/backend/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=3"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verifica se o email já está em uso
	existingUser, err := h.repos.User.FindByEmail(context.Background(), req.Email)
	if err != nil {
		h.logger.Error("erro ao verificar email", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email já está em uso"})
		return
	}

	// Gera o hash da senha
	h.logger.Info("Gerando hash da senha no registro",
		zap.String("email", req.Email),
		zap.String("senha", req.Password))

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		h.logger.Error("erro ao gerar hash da senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	h.logger.Info("Hash gerado com sucesso",
		zap.String("email", req.Email),
		zap.String("hash", string(hashedPassword)))

	// Cria o usuário
	user := &domain.User{
		ID:        uuid.New().String(),
		Name:      req.Name,
		Email:     req.Email,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.repos.User.Create(context.Background(), user); err != nil {
		h.logger.Error("erro ao criar usuário", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Gera o token JWT
	token, err := h.generateToken(user)
	if err != nil {
		h.logger.Error("erro ao gerar token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Usuário registrado com sucesso",
		"token":   token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Busca o usuário pelo email
	user, err := h.repos.User.FindByEmail(context.Background(), req.Email)
	if err != nil {
		h.logger.Error("erro ao buscar usuário",
			zap.Error(err),
			zap.String("email", req.Email))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if user == nil {
		h.logger.Info("usuário não encontrado",
			zap.String("email", req.Email))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
		return
	}

	// Verifica a senha
	h.logger.Info("Comparando senha no login",
		zap.String("email", req.Email),
		zap.String("hash armazenado", user.Password))

	if !user.CheckPassword(req.Password) {
		h.logger.Error("Senha incorreta",
			zap.String("email", req.Email))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
		return
	}

	// Gera o token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
		"role": user.Role,
	})

	// Assina o token
	cfg, _ := config.Load() // Carregar a configuração

	tokenString, err := token.SignedString([]byte(cfg.JWT.Secret))
	if err != nil {
		h.logger.Error("erro ao gerar token",
			zap.Error(err),
			zap.String("user_id", user.ID))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func (h *Handler) RefreshToken(c *gin.Context) {
	// Obtém o usuário do contexto (setado pelo middleware de autenticação)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	// Gera um novo token
	token, err := h.generateToken(user.(*domain.User))
	if err != nil {
		h.logger.Error("erro ao gerar token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Token atualizado com sucesso",
		"token":   token,
	})
}

func (h *Handler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Busca o usuário pelo email
	user, err := h.repos.User.FindByEmail(context.Background(), req.Email)
	if err != nil {
		h.logger.Error("erro ao buscar usuário", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if user == nil {
		// Por segurança, não informamos se o email existe ou não
		c.JSON(http.StatusOK, gin.H{"message": "Se o email existir, você receberá as instruções de recuperação"})
		return
	}

	// Gera um token de recuperação
	token := uuid.New().String()
	expiresAt := time.Now().Add(1 * time.Hour)

	// Salva o token no banco
	if err := h.repos.User.SaveResetToken(context.Background(), user.ID, token, expiresAt); err != nil {
		h.logger.Error("erro ao salvar token de recuperação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// TODO: Enviar email com o token de recuperação

	c.JSON(http.StatusOK, gin.H{"message": "Se o email existir, você receberá as instruções de recuperação"})
}

func (h *Handler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verifica o token
	user, err := h.repos.User.FindByResetToken(context.Background(), req.Token)
	if err != nil {
		h.logger.Error("erro ao verificar token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if user == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token inválido ou expirado"})
		return
	}

	// Gera o hash da nova senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		h.logger.Error("erro ao gerar hash da senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Atualiza a senha e limpa o token
	if err := h.repos.User.UpdatePassword(context.Background(), user.ID, string(hashedPassword)); err != nil {
		h.logger.Error("erro ao atualizar senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Senha atualizada com sucesso"})
}

func (h *Handler) ChangePassword(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Método ainda não implementado"})
}

func (h *Handler) generateToken(user *domain.User) (string, error) {
	// Carrega a configuração
	cfg, err := config.Load()
	if err != nil {
		return "", fmt.Errorf("erro ao carregar configuração: %v", err)
	}

	// Cria o token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
		"role": user.Role,
	})

	// Assina o token com a chave secreta do config
	tokenString, err := token.SignedString([]byte(cfg.JWT.Secret))
	if err != nil {
		return "", fmt.Errorf("erro ao assinar token: %v", err)
	}

	return tokenString, nil
}
