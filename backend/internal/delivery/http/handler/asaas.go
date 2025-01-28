package handler

import (
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AddAsaasConfigRequest struct {
	ApiKey       string `json:"api_key" binding:"required"`
	WebhookToken string `json:"webhook_token" binding:"required"`
}

func (h *Handler) AddAsaasConfig(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário tem permissão
	if community.CreatedBy != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para configurar o ASAAS"})
		return
	}

	var req AddAsaasConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	config := &domain.AsaasConfig{
		ID:           uuid.New().String(),
		CommunityID:  communityID,
		ApiKey:       req.ApiKey,
		WebhookToken: req.WebhookToken,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := h.repos.AsaasConfig.Create(c.Request.Context(), config); err != nil {
		h.logger.Error("erro ao criar configuração do ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Configuração do ASAAS criada com sucesso",
		"config":  config,
	})
}

func (h *Handler) GetAsaasConfig(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário tem permissão
	if community.CreatedBy != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para visualizar a configuração do ASAAS"})
		return
	}

	config, err := h.repos.AsaasConfig.FindByCommunityID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar configuração do ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if config == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Configuração do ASAAS não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"config": config,
	})
}

func (h *Handler) UpdateAsaasConfig(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário tem permissão
	if community.CreatedBy != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para atualizar a configuração do ASAAS"})
		return
	}

	// Busca a configuração existente
	config, err := h.repos.AsaasConfig.FindByCommunityID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar configuração do ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if config == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Configuração do ASAAS não encontrada"})
		return
	}

	var req AddAsaasConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Atualiza os campos
	config.ApiKey = req.ApiKey
	config.WebhookToken = req.WebhookToken
	config.UpdatedAt = time.Now()

	if err := h.repos.AsaasConfig.Update(c.Request.Context(), config); err != nil {
		h.logger.Error("erro ao atualizar configuração do ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Configuração do ASAAS atualizada com sucesso",
		"config":  config,
	})
}
