package handler

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/email"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CreateCommunicationRequest struct {
	Type          string `json:"type" binding:"required,oneof=EMAIL SMS WHATSAPP"`
	Subject       string `json:"subject" binding:"required"`
	Content       string `json:"content" binding:"required"`
	RecipientType string `json:"recipient_type" binding:"required,oneof=MEMBER GROUP FAMILY CUSTOM"`
	RecipientID   string `json:"recipient_id" binding:"required"`
}

type UpdateCommunicationRequest struct {
	Type          string `json:"type" binding:"required,oneof=EMAIL SMS WHATSAPP"`
	Subject       string `json:"subject" binding:"required"`
	Content       string `json:"content" binding:"required"`
	RecipientType string `json:"recipient_type" binding:"required,oneof=MEMBER GROUP FAMILY CUSTOM"`
	RecipientID   string `json:"recipient_id" binding:"required"`
}

type CreateTemplateRequest struct {
	Name    string `json:"name" binding:"required"`
	Type    string `json:"type" binding:"required,oneof=email sms whatsapp"`
	Subject string `json:"subject" binding:"required"`
	Content string `json:"content" binding:"required"`
}

type UpdateTemplateRequest struct {
	Name    string `json:"name" binding:"required"`
	Type    string `json:"type" binding:"required,oneof=email sms whatsapp"`
	Subject string `json:"subject" binding:"required"`
	Content string `json:"content" binding:"required"`
}

type UpdateSettingsRequest struct {
	EmailEnabled     bool   `json:"email_enabled"`
	EmailSMTPHost    string `json:"email_smtp_host"`
	EmailSMTPPort    int    `json:"email_smtp_port"`
	EmailUsername    string `json:"email_username"`
	EmailPassword    string `json:"email_password"`
	EmailFromName    string `json:"email_from_name"`
	EmailFromAddress string `json:"email_from_address"`
	SMSEnabled       bool   `json:"sms_enabled"`
	SMSProvider      string `json:"sms_provider"`
	SMSApiKey        string `json:"sms_api_key"`
	WhatsAppEnabled  bool   `json:"whatsapp_enabled"`
	WhatsAppProvider string `json:"whatsapp_provider"`
	WhatsAppApiKey   string `json:"whatsapp_api_key"`
}

func (h *Handler) CreateCommunication(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para criar comunicações"})
		return
	}

	var req CreateCommunicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	communication := &domain.Communication{
		ID:            uuid.New().String(),
		CommunityID:   communityID,
		Type:          domain.CommunicationType(req.Type),
		Status:        domain.CommunicationStatusPending,
		Subject:       req.Subject,
		Content:       req.Content,
		RecipientType: domain.RecipientType(req.RecipientType),
		RecipientID:   req.RecipientID,
		CreatedBy:     user.(*domain.User).ID,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := h.services.Communication.CreateCommunication(context.Background(), communityID, communication); err != nil {
		h.logger.Error("erro ao criar comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":       "Comunicação criada com sucesso",
		"communication": communication,
	})
}

func (h *Handler) ListCommunications(c *gin.Context) {
	communityID := c.Param("communityId")

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

	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
	}
	if pageQuery := c.Query("page"); pageQuery != "" {
		if _, err := fmt.Sscanf(pageQuery, "%d", &filter.Page); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Página inválida"})
			return
		}
	}
	if perPageQuery := c.Query("per_page"); perPageQuery != "" {
		if _, err := fmt.Sscanf(perPageQuery, "%d", &filter.PerPage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Limite inválido"})
			return
		}
	}

	communications, total, err := h.services.Communication.ListCommunications(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar comunicações", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"communications": communications,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

func (h *Handler) GetCommunication(c *gin.Context) {
	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

	communication, err := h.services.Communication.GetCommunication(context.Background(), communityID, communicationID)
	if err != nil {
		h.logger.Error("erro ao buscar comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if communication == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunicação não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"communication": communication,
	})
}

func (h *Handler) UpdateCommunication(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar comunicações"})
		return
	}

	communication, err := h.services.Communication.GetCommunication(context.Background(), communityID, communicationID)
	if err != nil {
		h.logger.Error("erro ao buscar comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if communication == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunicação não encontrada"})
		return
	}

	var req UpdateCommunicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("erro ao validar dados",
			zap.Error(err),
			zap.Any("request", req))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	communication.Type = domain.CommunicationType(req.Type)
	communication.Subject = req.Subject
	communication.Content = req.Content
	communication.RecipientType = domain.RecipientType(req.RecipientType)
	communication.RecipientID = req.RecipientID
	communication.UpdatedAt = time.Now()

	if err := h.services.Communication.UpdateCommunication(context.Background(), communityID, communicationID, communication); err != nil {
		h.logger.Error("erro ao atualizar comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Comunicação atualizada com sucesso",
		"communication": communication,
	})
}

func (h *Handler) DeleteCommunication(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para excluir comunicações"})
		return
	}

	communication, err := h.services.Communication.GetCommunication(context.Background(), communityID, communicationID)
	if err != nil {
		h.logger.Error("erro ao buscar comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if communication == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunicação não encontrada"})
		return
	}

	if err := h.services.Communication.DeleteCommunication(context.Background(), communityID, communicationID); err != nil {
		h.logger.Error("erro ao excluir comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Comunicação excluída com sucesso",
	})
}

func (h *Handler) SendCommunication(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para enviar comunicações"})
		return
	}

	communication, err := h.services.Communication.GetCommunication(context.Background(), communityID, communicationID)
	if err != nil {
		h.logger.Error("erro ao buscar comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if communication == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunicação não encontrada"})
		return
	}

	if err := h.services.Communication.SendCommunication(context.Background(), communityID, communicationID); err != nil {
		h.logger.Error("erro ao enviar comunicação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Comunicação enviada com sucesso",
	})
}

func (h *Handler) CreateTemplate(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para criar templates"})
		return
	}

	var req CreateTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	template := &domain.CommunicationTemplate{
		ID:          uuid.New().String(),
		CommunityID: communityID,
		Name:        req.Name,
		Type:        domain.CommunicationType(req.Type),
		Subject:     req.Subject,
		Content:     req.Content,
		CreatedBy:   user.(*domain.User).ID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.services.Communication.CreateTemplate(context.Background(), communityID, template); err != nil {
		h.logger.Error("erro ao criar template", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Template criado com sucesso",
		"template": template,
	})
}

func (h *Handler) ListTemplates(c *gin.Context) {
	communityID := c.Param("communityId")

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

	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
	}
	if pageQuery := c.Query("page"); pageQuery != "" {
		if _, err := fmt.Sscanf(pageQuery, "%d", &filter.Page); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Página inválida"})
			return
		}
	}
	if perPageQuery := c.Query("per_page"); perPageQuery != "" {
		if _, err := fmt.Sscanf(perPageQuery, "%d", &filter.PerPage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Limite inválido"})
			return
		}
	}

	templates, total, err := h.services.Communication.ListTemplates(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar templates", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"templates": templates,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

func (h *Handler) GetTemplate(c *gin.Context) {
	communityID := c.Param("communityId")
	templateID := c.Param("templateId")

	template, err := h.services.Communication.GetTemplate(context.Background(), communityID, templateID)
	if err != nil {
		h.logger.Error("erro ao buscar template", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if template == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"template": template,
	})
}

func (h *Handler) UpdateTemplate(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	templateID := c.Param("templateId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar templates"})
		return
	}

	template, err := h.services.Communication.GetTemplate(context.Background(), communityID, templateID)
	if err != nil {
		h.logger.Error("erro ao buscar template", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if template == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template não encontrado"})
		return
	}

	var req UpdateTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("erro ao validar dados",
			zap.Error(err),
			zap.Any("request", req))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	template.Name = req.Name
	template.Type = domain.CommunicationType(req.Type)
	template.Subject = req.Subject
	template.Content = req.Content
	template.UpdatedAt = time.Now()

	if err := h.services.Communication.UpdateTemplate(context.Background(), communityID, templateID, template); err != nil {
		h.logger.Error("erro ao atualizar template", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Template atualizado com sucesso",
		"template": template,
	})
}

func (h *Handler) DeleteTemplate(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	templateID := c.Param("templateId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para excluir templates"})
		return
	}

	template, err := h.services.Communication.GetTemplate(context.Background(), communityID, templateID)
	if err != nil {
		h.logger.Error("erro ao buscar template", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if template == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template não encontrado"})
		return
	}

	if err := h.services.Communication.DeleteTemplate(context.Background(), communityID, templateID); err != nil {
		h.logger.Error("erro ao excluir template", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Template excluído com sucesso",
	})
}

func (h *Handler) GetCommunicationSettings(c *gin.Context) {
	communityID := c.Param("communityId")

	settings, err := h.services.Communication.GetCommunicationSettings(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar configurações", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if settings == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Configurações não encontradas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"settings": settings,
	})
}

func (h *Handler) UpdateCommunicationSettings(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para atualizar configurações"})
		return
	}

	var req UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("erro ao validar dados",
			zap.Error(err),
			zap.Any("request", req))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	settings := &domain.CommunicationSettings{
		CommunityID:      communityID,
		EmailEnabled:     req.EmailEnabled,
		EmailSMTPHost:    req.EmailSMTPHost,
		EmailSMTPPort:    req.EmailSMTPPort,
		EmailUsername:    req.EmailUsername,
		EmailPassword:    req.EmailPassword,
		EmailFromName:    req.EmailFromName,
		EmailFromAddress: req.EmailFromAddress,
		SMSEnabled:       req.SMSEnabled,
		SMSProvider:      req.SMSProvider,
		SMSApiKey:        req.SMSApiKey,
		WhatsAppEnabled:  req.WhatsAppEnabled,
		WhatsAppProvider: req.WhatsAppProvider,
		WhatsAppApiKey:   req.WhatsAppApiKey,
		UpdatedAt:        time.Now(),
	}

	if err := h.services.Communication.UpdateCommunicationSettings(context.Background(), communityID, settings); err != nil {
		h.logger.Error("erro ao atualizar configurações", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Configurações atualizadas com sucesso",
		"settings": settings,
	})
}

func (h *Handler) CreateCommunicationSettings(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para criar configurações"})
		return
	}

	// Verificar se já existem configurações
	existing, err := h.services.Communication.GetCommunicationSettings(context.Background(), communityID)
	if err == nil && existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Configurações já existem. Use PUT para atualizar."})
		return
	}

	var req UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("erro ao validar dados",
			zap.Error(err),
			zap.Any("request", req))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	settings := &domain.CommunicationSettings{
		CommunityID:      communityID,
		EmailEnabled:     req.EmailEnabled,
		EmailSMTPHost:    req.EmailSMTPHost,
		EmailSMTPPort:    req.EmailSMTPPort,
		EmailUsername:    req.EmailUsername,
		EmailPassword:    req.EmailPassword,
		EmailFromName:    req.EmailFromName,
		EmailFromAddress: req.EmailFromAddress,
		SMSEnabled:       req.SMSEnabled,
		SMSProvider:      req.SMSProvider,
		SMSApiKey:        req.SMSApiKey,
		WhatsAppEnabled:  req.WhatsAppEnabled,
		WhatsAppProvider: req.WhatsAppProvider,
		WhatsAppApiKey:   req.WhatsAppApiKey,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := h.services.Communication.UpdateCommunicationSettings(context.Background(), communityID, settings); err != nil {
		h.logger.Error("erro ao criar configurações", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Configurações criadas com sucesso",
		"settings": settings,
	})
}

func (h *Handler) TestEmail(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para testar configurações"})
		return
	}

	// Busca as configurações de e-mail
	settings, err := h.services.Communication.GetCommunicationSettings(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar configurações", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar configurações de e-mail"})
		return
	}
	if settings == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Configurações de e-mail não encontradas"})
		return
	}

	if !settings.EmailEnabled {
		c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail não está habilitado nas configurações"})
		return
	}

	// Cria um cliente de e-mail com as configurações
	mailer := email.NewMailer(&email.Config{
		Host:     settings.EmailSMTPHost,
		Port:     settings.EmailSMTPPort,
		Username: settings.EmailUsername,
		Password: settings.EmailPassword,
		From:     settings.EmailFromAddress,
	})

	// Envia um e-mail de teste
	err = mailer.SendTestEmail(settings.EmailFromAddress, settings.EmailFromName)
	if err != nil {
		h.logger.Error("erro ao enviar e-mail de teste", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Erro ao enviar e-mail de teste: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "E-mail de teste enviado com sucesso",
	})
}
