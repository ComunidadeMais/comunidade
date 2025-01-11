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

type CreateEventRequest struct {
	Title       string    `json:"title" binding:"required,min=3"`
	Description string    `json:"description" binding:"required"`
	StartDate   time.Time `json:"start_date" binding:"required"`
	EndDate     time.Time `json:"end_date" binding:"required"`
	Location    string    `json:"location" binding:"required"`
	Type        string    `json:"type" binding:"required,oneof=culto service class meeting visit other"`
	Recurrence  string    `json:"recurrence" binding:"required,oneof=none daily weekly monthly"`
}

type UpdateEventRequest struct {
	Title       string    `json:"title" binding:"required,min=3"`
	Description string    `json:"description" binding:"required"`
	StartDate   time.Time `json:"start_date" binding:"required"`
	EndDate     time.Time `json:"end_date" binding:"required"`
	Location    string    `json:"location" binding:"required"`
	Type        string    `json:"type" binding:"required,oneof=culto service class meeting visit other"`
	Recurrence  string    `json:"recurrence" binding:"required,oneof=none daily weekly monthly"`
}

type RegisterAttendanceRequest struct {
	Status string `json:"status" binding:"required,oneof=present absent late"`
}

func (h *Handler) CreateEvent(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

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

	// Verifica se o usuário tem permissão para criar eventos
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para criar eventos"})
		return
	}

	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Valida as datas
	if req.EndDate.Before(req.StartDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A data de término deve ser posterior à data de início"})
		return
	}

	// Cria o evento
	event := &domain.Event{
		ID:          uuid.New().String(),
		CommunityID: communityID,
		Title:       req.Title,
		Description: req.Description,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		Location:    req.Location,
		Type:        req.Type,
		Recurrence:  req.Recurrence,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.Event.Create(context.Background(), event); err != nil {
		h.logger.Error("erro ao criar evento", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Evento criado com sucesso",
		"event":   event,
	})
}

func (h *Handler) ListEvents(c *gin.Context) {
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

	// Obtém os parâmetros de paginação
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

	// Lista os eventos
	events, total, err := h.repos.Event.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar eventos", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

func (h *Handler) GetEvent(c *gin.Context) {
	communityID := c.Param("communityId")
	eventID := c.Param("eventId")

	// Busca o evento
	event, err := h.repos.Event.FindByID(context.Background(), communityID, eventID)
	if err != nil {
		h.logger.Error("erro ao buscar evento", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if event == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"event": event,
	})
}

func (h *Handler) UpdateEvent(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	eventID := c.Param("eventId")

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

	// Verifica se o usuário tem permissão para editar eventos
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar eventos"})
		return
	}

	// Busca o evento
	event, err := h.repos.Event.FindByID(context.Background(), communityID, eventID)
	if err != nil {
		h.logger.Error("erro ao buscar evento", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if event == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
		return
	}

	var req UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("erro ao validar dados",
			zap.Error(err),
			zap.Any("request", req))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Valida as datas
	if req.EndDate.Before(req.StartDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A data de término deve ser posterior à data de início"})
		return
	}

	// Log dos dados antes da atualização
	h.logger.Info("atualizando evento",
		zap.String("event_id", eventID),
		zap.Any("old_data", event),
		zap.Any("new_data", req))

	// Atualiza o evento
	event.Title = req.Title
	event.Description = req.Description
	event.StartDate = req.StartDate
	event.EndDate = req.EndDate
	event.Location = req.Location
	event.Type = req.Type
	event.Recurrence = req.Recurrence
	event.UpdatedAt = time.Now()

	if err := h.repos.Event.Update(context.Background(), event); err != nil {
		h.logger.Error("erro ao atualizar evento",
			zap.Error(err),
			zap.String("event_id", eventID),
			zap.Any("event", event))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Log após a atualização
	h.logger.Info("evento atualizado com sucesso",
		zap.String("event_id", eventID),
		zap.Any("event", event))

	c.JSON(http.StatusOK, gin.H{
		"message": "Evento atualizado com sucesso",
		"event":   event,
	})
}

func (h *Handler) DeleteEvent(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	eventID := c.Param("eventId")

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

	// Verifica se o usuário tem permissão para remover eventos
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para remover eventos"})
		return
	}

	// Remove o evento
	if err := h.repos.Event.Delete(context.Background(), communityID, eventID); err != nil {
		h.logger.Error("erro ao remover evento", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Evento removido com sucesso",
	})
}

func (h *Handler) RegisterAttendance(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	eventID := c.Param("eventId")
	memberID := c.Param("memberId")

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

	// Verifica se o usuário tem permissão para registrar presença
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para registrar presença"})
		return
	}

	// Verifica se o evento existe
	event, err := h.repos.Event.FindByID(context.Background(), communityID, eventID)
	if err != nil {
		h.logger.Error("erro ao buscar evento", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if event == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
		return
	}

	// Verifica se o membro existe
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

	var req RegisterAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Registra a presença
	attendance := &domain.Attendance{
		ID:        uuid.New().String(),
		EventID:   eventID,
		MemberID:  memberID,
		Status:    req.Status,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.repos.Event.RegisterAttendance(context.Background(), attendance); err != nil {
		h.logger.Error("erro ao registrar presença", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Presença registrada com sucesso",
		"attendance": attendance,
	})
}

func (h *Handler) UpdateAttendance(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	eventID := c.Param("eventId")
	memberID := c.Param("memberId")

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

	// Verifica se o usuário tem permissão para atualizar presença
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para atualizar presença"})
		return
	}

	// Verifica se o evento existe
	event, err := h.repos.Event.FindByID(context.Background(), communityID, eventID)
	if err != nil {
		h.logger.Error("erro ao buscar evento", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if event == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
		return
	}

	// Verifica se o membro existe
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

	var req RegisterAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Atualiza a presença
	attendance := &domain.Attendance{
		EventID:   eventID,
		MemberID:  memberID,
		Status:    req.Status,
		UpdatedAt: time.Now(),
	}

	if err := h.repos.Event.UpdateAttendance(context.Background(), attendance); err != nil {
		h.logger.Error("erro ao atualizar presença", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Presença atualizada com sucesso",
		"attendance": attendance,
	})
}
