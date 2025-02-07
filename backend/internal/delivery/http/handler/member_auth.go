package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

type MemberSignUpRequest struct {
	CommunityID string `json:"community_id" binding:"required"`
	CPF         string `json:"cpf" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
}

type MemberLoginRequest struct {
	Login    string `json:"login" binding:"required"` // Pode ser CPF ou Email
	Password string `json:"password" binding:"required"`
}

type MemberForgotPasswordRequest struct {
	CommunityID string `json:"community_id" binding:"required"`
	Login       string `json:"login" binding:"required"` // Pode ser CPF ou Email
}

type MemberResetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

// MemberSignUp permite que um membro crie uma senha para acessar o portal
func (h *Handler) MemberSignUp(c *gin.Context) {
	var req MemberSignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Busca o membro pelo CPF e email
	member, err := h.repos.Member.FindByEmailOrCPF(context.Background(), req.CommunityID, req.Email, req.CPF)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado. Verifique seu CPF e email."})
		return
	}

	// Verifica se o membro já tem senha cadastrada
	if member.Password != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Membro já possui cadastro no portal"})
		return
	}

	// Define a senha do membro
	if err := member.SetPassword(req.Password); err != nil {
		h.logger.Error("erro ao definir senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao definir senha"})
		return
	}

	// Atualiza o membro no banco
	if err := h.repos.Member.Update(context.Background(), member); err != nil {
		h.logger.Error("erro ao atualizar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar membro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Cadastro realizado com sucesso",
	})
}

// MemberLogin realiza o login do membro
func (h *Handler) MemberLogin(c *gin.Context) {
	var req MemberLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	communityID := c.Param("communityId")

	// Busca o membro pelo CPF ou email
	member, err := h.repos.Member.FindByEmailOrCPF(context.Background(), communityID, req.Login, req.Login)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	if member == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
		return
	}

	// Verifica a senha
	if !member.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
		return
	}

	// Gera o token JWT
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["sub"] = member.ID
	claims["community_id"] = member.CommunityID
	claims["role"] = member.Role
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	// Assina o token
	tokenString, err := token.SignedString([]byte("seu_segredo_jwt"))
	if err != nil {
		h.logger.Error("erro ao gerar token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}

	// Atualiza último login
	now := time.Now()
	member.LastLogin = &now
	if err := h.repos.Member.Update(context.Background(), member); err != nil {
		h.logger.Error("erro ao atualizar último login", zap.Error(err))
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"member": gin.H{
			"id":    member.ID,
			"name":  member.Name,
			"email": member.Email,
			"role":  member.Role,
		},
	})
}

// MemberForgotPassword inicia o processo de recuperação de senha
func (h *Handler) MemberForgotPassword(c *gin.Context) {
	var req MemberForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Busca o membro pelo CPF ou email
	member, err := h.repos.Member.FindByEmailOrCPF(context.Background(), req.CommunityID, req.Login, req.Login)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
		return
	}

	// Gera token de reset
	token, err := member.GeneratePasswordResetToken()
	if err != nil {
		h.logger.Error("erro ao gerar token de reset", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}

	// Atualiza o membro com o token
	if err := h.repos.Member.Update(context.Background(), member); err != nil {
		h.logger.Error("erro ao atualizar token de reset", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar token"})
		return
	}

	// TODO: Enviar email com o token

	c.JSON(http.StatusOK, gin.H{
		"message": "Instruções de recuperação de senha enviadas para seu email",
		"token":   token, // Temporary for development
	})
}

// MemberResetPassword redefine a senha do membro
func (h *Handler) MemberResetPassword(c *gin.Context) {
	var req MemberResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	communityID := c.Param("communityId")
	memberID := c.Param("memberId")

	// Busca o membro
	member, err := h.repos.Member.FindByID(context.Background(), communityID, memberID)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
		return
	}

	// Valida o token
	if !member.IsPasswordResetTokenValid(req.Token) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token inválido ou expirado"})
		return
	}

	// Define a nova senha
	if err := member.SetPassword(req.Password); err != nil {
		h.logger.Error("erro ao definir nova senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao definir senha"})
		return
	}

	// Limpa o token de reset
	member.PasswordResetToken = ""
	member.TokenExpiresAt = nil

	// Atualiza o membro
	if err := h.repos.Member.Update(context.Background(), member); err != nil {
		h.logger.Error("erro ao atualizar senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar senha"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Senha redefinida com sucesso",
	})
}
