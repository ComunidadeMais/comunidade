package handler

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CreateCommunityRequest struct {
	Name        string `json:"name" binding:"required,min=3"`
	Slug        string `json:"slug" binding:"required,min=3"`
	Description string `json:"description" binding:"required"`
}

type UpdateCommunityRequest struct {
	Name                    string `json:"name" binding:"required,min=3"`
	Slug                    string `json:"slug" binding:"required,min=3"`
	Description             string `json:"description" binding:"required"`
	Logo                    string `json:"logo"`
	Banner                  string `json:"banner"`
	Website                 string `json:"website"`
	Email                   string `json:"email"`
	Phone                   string `json:"phone"`
	Address                 string `json:"address"`
	City                    string `json:"city"`
	State                   string `json:"state"`
	Country                 string `json:"country"`
	ZipCode                 string `json:"zip_code"`
	Timezone                string `json:"timezone"`
	Language                string `json:"language"`
	Status                  string `json:"status" binding:"required,oneof=active inactive archived"`
	Type                    string `json:"type" binding:"required,oneof=church ministry organization other"`
	AllowPublicEvents       bool   `json:"allow_public_events"`
	AllowPublicGroups       bool   `json:"allow_public_groups"`
	AllowMemberRegistration bool   `json:"allow_member_registration"`
	RequireApproval         bool   `json:"require_approval"`
	AllowGuestAttendance    bool   `json:"allow_guest_attendance"`
	EnableContributions     bool   `json:"enable_contributions"`
	EnableEvents            bool   `json:"enable_events"`
	EnableGroups            bool   `json:"enable_groups"`
	EnableAttendance        bool   `json:"enable_attendance"`
}

func (h *Handler) CreateCommunity(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	var req CreateCommunityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verifica se o slug já está em uso
	existingCommunity, err := h.repos.Community.FindBySlug(context.Background(), req.Slug)
	if err != nil {
		h.logger.Error("erro ao verificar slug", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if existingCommunity != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Slug já está em uso"})
		return
	}

	// Cria a comunidade
	community := &domain.Community{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		CreatedBy:   user.(*domain.User).ID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.Community.Create(context.Background(), community); err != nil {
		h.logger.Error("erro ao criar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Comunidade criada com sucesso",
		"community": community,
	})
}

func (h *Handler) ListCommunities(c *gin.Context) {
	// Obtém os parâmetros de paginação
	page := 1
	limit := 10
	if pageQuery := c.Query("page"); pageQuery != "" {
		if _, err := fmt.Sscanf(pageQuery, "%d", &page); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Página inválida"})
			return
		}
	}
	if limitQuery := c.Query("limit"); limitQuery != "" {
		if _, err := fmt.Sscanf(limitQuery, "%d", &limit); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Limite inválido"})
			return
		}
	}

	// Lista as comunidades
	filter := &repository.Filter{
		Page:    page,
		PerPage: limit,
	}
	communities, total, err := h.repos.Community.List(context.Background(), filter)
	if err != nil {
		h.logger.Error("erro ao listar comunidades", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"communities": communities,
		"pagination": gin.H{
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func (h *Handler) GetCommunity(c *gin.Context) {
	communityID := c.Param("communityId")

	// Busca a comunidade
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"community": community,
	})
}

func (h *Handler) UpdateCommunity(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

	// Busca a comunidade
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário é o criador da comunidade
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar esta comunidade"})
		return
	}

	var req UpdateCommunityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Atualiza a comunidade
	community.Name = req.Name
	community.Slug = req.Slug
	community.Description = req.Description
	community.Logo = req.Logo
	community.Banner = req.Banner
	community.Website = req.Website
	community.Email = req.Email
	community.Phone = req.Phone
	community.Address = req.Address
	community.City = req.City
	community.State = req.State
	community.Country = req.Country
	community.ZipCode = req.ZipCode
	community.Timezone = req.Timezone
	community.Language = req.Language
	community.Status = req.Status
	community.Type = req.Type
	community.AllowPublicEvents = req.AllowPublicEvents
	community.AllowPublicGroups = req.AllowPublicGroups
	community.AllowMemberRegistration = req.AllowMemberRegistration
	community.RequireApproval = req.RequireApproval
	community.AllowGuestAttendance = req.AllowGuestAttendance
	community.EnableContributions = req.EnableContributions
	community.EnableEvents = req.EnableEvents
	community.EnableGroups = req.EnableGroups
	community.EnableAttendance = req.EnableAttendance
	community.UpdatedAt = time.Now()

	if err := h.repos.Community.Update(context.Background(), community); err != nil {
		h.logger.Error("erro ao atualizar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Comunidade atualizada com sucesso",
		"community": community,
	})
}

func (h *Handler) DeleteCommunity(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

	// Busca a comunidade
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário é o criador da comunidade
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para excluir esta comunidade"})
		return
	}

	// Remove a comunidade
	if err := h.repos.Community.Delete(context.Background(), communityID); err != nil {
		h.logger.Error("erro ao excluir comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Comunidade excluída com sucesso",
	})
}

func (h *Handler) UploadCommunityLogo(c *gin.Context) {
	communityID := c.Param("communityId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário é o criador da comunidade
	user, exists := c.Get("user")
	if !exists || community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar esta comunidade"})
		return
	}

	// Recebe o arquivo
	file, err := c.FormFile("logo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Arquivo inválido"})
		return
	}

	// Salva o arquivo
	filepath, err := h.services.Upload.SaveFile(file, "communities/logos")
	if err != nil {
		h.logger.Error("erro ao salvar logo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar imagem"})
		return
	}

	// Se já existir um logo, deleta o anterior
	if community.Logo != "" {
		if err := h.services.Upload.DeleteFile(community.Logo); err != nil {
			h.logger.Error("erro ao deletar logo antigo", zap.Error(err))
		}
	}

	// Atualiza o caminho do logo no banco de dados
	community.Logo = filepath
	if err := h.repos.Community.Update(context.Background(), community); err != nil {
		h.logger.Error("erro ao atualizar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar comunidade"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Logo atualizado com sucesso",
		"logo":    filepath,
	})
}

func (h *Handler) UploadCommunityBanner(c *gin.Context) {
	communityID := c.Param("communityId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário é o criador da comunidade
	user, exists := c.Get("user")
	if !exists || community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar esta comunidade"})
		return
	}

	// Recebe o arquivo
	file, err := c.FormFile("banner")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Arquivo inválido"})
		return
	}

	// Salva o arquivo
	filepath, err := h.services.Upload.SaveFile(file, "communities/banners")
	if err != nil {
		h.logger.Error("erro ao salvar banner", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar imagem"})
		return
	}

	// Se já existir um banner, deleta o anterior
	if community.Banner != "" {
		if err := h.services.Upload.DeleteFile(community.Banner); err != nil {
			h.logger.Error("erro ao deletar banner antigo", zap.Error(err))
		}
	}

	// Atualiza o caminho do banner no banco de dados
	community.Banner = filepath
	if err := h.repos.Community.Update(context.Background(), community); err != nil {
		h.logger.Error("erro ao atualizar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar comunidade"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Banner atualizado com sucesso",
		"banner":  filepath,
	})
}
