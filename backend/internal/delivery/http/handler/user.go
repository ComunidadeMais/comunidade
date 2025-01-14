package handler

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type UpdateProfileRequest struct {
	Name          string `json:"name" binding:"required,min=3"`
	Phone         string `json:"phone"`
	Bio           string `json:"bio"`
	DateOfBirth   string `json:"date_of_birth"`
	Gender        string `json:"gender"`
	Address       string `json:"address"`
	City          string `json:"city"`
	State         string `json:"state"`
	Country       string `json:"country"`
	ZipCode       string `json:"zip_code"`
	Language      string `json:"language"`
	Theme         string `json:"theme" binding:"oneof=light dark"`
	Timezone      string `json:"timezone"`
	NotifyByEmail bool   `json:"notify_by_email"`
	NotifyByPhone bool   `json:"notify_by_phone"`
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

func (h *Handler) GetProfile(c *gin.Context) {
	// Obtém o usuário do contexto (setado pelo middleware de autenticação)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	currentUser := user.(*domain.User)

	// Adiciona o URL base ao avatar se existir
	if currentUser.Avatar != "" {
		currentUser.Avatar = fmt.Sprintf("http://localhost:8080/%s", currentUser.Avatar)
	}

	c.JSON(http.StatusOK, gin.H{
		"user": currentUser,
	})
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Atualiza os dados do usuário
	currentUser := user.(*domain.User)
	currentUser.Name = req.Name
	currentUser.Phone = req.Phone
	currentUser.Bio = req.Bio
	if req.DateOfBirth != "" {
		if date, err := time.Parse("2006-01-02", req.DateOfBirth); err == nil {
			currentUser.DateOfBirth = &date
		}
	}
	currentUser.Gender = req.Gender
	currentUser.Address = req.Address
	currentUser.City = req.City
	currentUser.State = req.State
	currentUser.Country = req.Country
	currentUser.ZipCode = req.ZipCode
	currentUser.Language = req.Language
	currentUser.Theme = req.Theme
	currentUser.Timezone = req.Timezone
	currentUser.NotifyByEmail = req.NotifyByEmail
	currentUser.NotifyByPhone = req.NotifyByPhone

	if err := h.repos.User.Update(context.Background(), currentUser); err != nil {
		h.logger.Error("erro ao atualizar usuário", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Perfil atualizado com sucesso",
		"user":    currentUser,
	})
}

func (h *Handler) UpdatePassword(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	currentUser := user.(*domain.User)

	// Verifica a senha atual
	if err := bcrypt.CompareHashAndPassword([]byte(currentUser.Password), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha atual incorreta"})
		return
	}

	// Gera o hash da nova senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		h.logger.Error("erro ao gerar hash da senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Atualiza a senha
	if err := h.repos.User.UpdatePassword(context.Background(), currentUser.ID, string(hashedPassword)); err != nil {
		h.logger.Error("erro ao atualizar senha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Senha atualizada com sucesso",
	})
}

func (h *Handler) UpdateAvatar(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}
	currentUser := user.(*domain.User)

	// Recebe o arquivo
	file, err := c.FormFile("avatar")
	if err != nil {
		h.logger.Error("erro ao receber arquivo", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Arquivo inválido"})
		return
	}

	// Verifica o tipo do arquivo
	if !isValidImageType(file.Header.Get("Content-Type")) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo de arquivo não permitido. Use apenas imagens (jpg, png, gif)"})
		return
	}

	// Cria o diretório de uploads se não existir
	uploadDir := "uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		h.logger.Error("erro ao criar diretório de uploads", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar arquivo"})
		return
	}

	// Gera um nome único para o arquivo
	filename := fmt.Sprintf("%s%s", uuid.New().String(), filepath.Ext(file.Filename))
	filePath := filepath.Join(uploadDir, filename)

	// Remove o avatar antigo se existir
	if currentUser.Avatar != "" {
		oldPath := strings.TrimPrefix(currentUser.Avatar, "http://localhost:8080/")
		oldFilePath := filepath.Join(".", oldPath)
		if err := os.Remove(oldFilePath); err != nil {
			h.logger.Error("erro ao remover avatar antigo", zap.Error(err))
		}
	}

	// Salva o novo arquivo
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		h.logger.Error("erro ao salvar arquivo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar arquivo"})
		return
	}

	// Atualiza o caminho do avatar no banco de dados
	currentUser.Avatar = filePath
	if err := h.repos.User.Update(context.Background(), currentUser); err != nil {
		h.logger.Error("erro ao atualizar avatar no banco", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar avatar"})
		return
	}

	// Retorna a URL completa do avatar
	avatarURL := fmt.Sprintf("http://localhost:8080/%s", filePath)
	currentUser.Avatar = avatarURL

	c.JSON(http.StatusOK, gin.H{
		"message": "Avatar atualizado com sucesso",
		"user":    currentUser,
	})
}

func isValidImageType(contentType string) bool {
	validTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
	}
	return validTypes[contentType]
}

func (h *Handler) ListUsers(c *gin.Context) {
	// Obtém os parâmetros de paginação
	page := 1
	perPage := 10

	if pageQuery := c.Query("page"); pageQuery != "" {
		if _, err := fmt.Sscanf(pageQuery, "%d", &page); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Página inválida"})
			return
		}
	}
	if perPageQuery := c.Query("per_page"); perPageQuery != "" {
		if _, err := fmt.Sscanf(perPageQuery, "%d", &perPage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Limite inválido"})
			return
		}
	}

	// Lista os usuários
	users, total, err := h.repos.User.List(context.Background(), &repository.Filter{
		Page:    page,
		PerPage: perPage,
	})
	if err != nil {
		h.logger.Error("erro ao listar usuários", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Adiciona o URL base aos avatares
	for i := range users {
		if users[i].Avatar != "" {
			users[i].Avatar = fmt.Sprintf("http://localhost:8080/%s", users[i].Avatar)
		}
	}

	h.logger.Info("listando usuários",
		zap.Int("total", int(total)),
		zap.Int("page", page),
		zap.Int("per_page", perPage))

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"pagination": gin.H{
			"total":       total,
			"page":        page,
			"per_page":    perPage,
			"total_pages": (total + int64(perPage) - 1) / int64(perPage),
		},
	})
}
