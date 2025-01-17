package http

import (
	"net/http"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type CheckInHandler struct {
	checkInService service.CheckInService
}

func NewCheckInHandler(checkInService service.CheckInService) *CheckInHandler {
	return &CheckInHandler{
		checkInService: checkInService,
	}
}

func (h *CheckInHandler) RegisterRoutes(router *gin.Engine) {
	checkIn := router.Group("/api/v1/checkin")
	{
		checkIn.POST("", h.CreateCheckIn)
		checkIn.GET("/event/:eventId", h.GetEventCheckIns)
		checkIn.GET("/event/:eventId/stats", h.GetEventStats)
	}
}

// CreateCheckIn godoc
// @Summary Criar um novo check-in
// @Description Cria um novo check-in para um evento
// @Tags check-in
// @Accept json
// @Produce json
// @Param request body domain.CheckInRequest true "Dados do check-in"
// @Success 201 {object} domain.CheckIn
// @Router /api/v1/checkin [post]
func (h *CheckInHandler) CreateCheckIn(c *gin.Context) {
	var request domain.CheckInRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.checkInService.CreateCheckIn(c.Request.Context(), &request); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusCreated)
}

// GetEventCheckIns godoc
// @Summary Listar check-ins de um evento
// @Description Retorna a lista de check-ins de um evento específico
// @Tags check-in
// @Accept json
// @Produce json
// @Param eventId path int true "ID do evento"
// @Success 200 {array} domain.CheckIn
// @Router /api/v1/checkin/event/{eventId} [get]
func (h *CheckInHandler) GetEventCheckIns(c *gin.Context) {
	eventID := c.Param("eventId")
	checkIns, err := h.checkInService.GetEventCheckIns(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, checkIns)
}

// GetEventStats godoc
// @Summary Obter estatísticas de check-in do evento
// @Description Retorna estatísticas de check-in para um evento específico
// @Tags check-in
// @Accept json
// @Produce json
// @Param eventId path int true "ID do evento"
// @Success 200 {object} domain.CheckInStats
// @Router /api/v1/checkin/event/{eventId}/stats [get]
func (h *CheckInHandler) GetEventStats(c *gin.Context) {
	eventID := c.Param("eventId")
	stats, err := h.checkInService.GetEventStats(c.Request.Context(), eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}
