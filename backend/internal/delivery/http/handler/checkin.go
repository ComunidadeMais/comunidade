package handler

import (
	"net/http"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *Handler) CreateCheckIn(c *gin.Context) {
	var request domain.CheckInRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.services.CheckIn.CreateCheckIn(c.Request.Context(), &request); err != nil {
		h.logger.Error("erro ao criar check-in", zap.Error(err))

		switch err {
		case service.ErrDuplicateCheckIn:
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		case service.ErrEventNotFound:
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		}
		return
	}

	c.Status(http.StatusCreated)
}

func (h *Handler) GetEventCheckIns(c *gin.Context) {
	eventID := c.Param("eventId")
	checkIns, err := h.services.CheckIn.GetEventCheckIns(c.Request.Context(), eventID)
	if err != nil {
		h.logger.Error("erro ao buscar check-ins", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, checkIns)
}

func (h *Handler) GetEventStats(c *gin.Context) {
	eventID := c.Param("eventId")
	stats, err := h.services.CheckIn.GetEventStats(c.Request.Context(), eventID)
	if err != nil {
		h.logger.Error("erro ao buscar estatísticas", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
