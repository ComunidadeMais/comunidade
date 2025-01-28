package handler

import (
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AddCampaignRequest struct {
	Name        string     `json:"name" binding:"required"`
	Description string     `json:"description"`
	Goal        float64    `json:"goal" binding:"required"`
	StartDate   time.Time  `json:"start_date" binding:"required"`
	EndDate     *time.Time `json:"end_date"`
	EventID     *string    `json:"event_id"`
}

func (h *Handler) AddCampaign(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	var req AddCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	campaign := &domain.Campaign{
		ID:          uuid.New().String(),
		CommunityID: communityID,
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Goal:        req.Goal,
		StartDate:   req.StartDate,
		EndDate:     req.EndDate,
		EventID:     req.EventID,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.Campaign.Create(c.Request.Context(), campaign); err != nil {
		h.logger.Error("erro ao criar campanha", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Campanha criada com sucesso",
		"campaign": campaign,
	})
}

func (h *Handler) ListCampaigns(c *gin.Context) {
	communityID := c.Param("communityId")

	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
	}

	campaigns, err := h.repos.Campaign.List(c.Request.Context(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar campanhas", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"campaigns": campaigns,
	})
}
