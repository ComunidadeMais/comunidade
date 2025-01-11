package handler

import (
	"net/http"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/comunidade/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type CommunicationHandler struct {
	service service.CommunicationService
}

func NewCommunicationHandler(service service.CommunicationService) *CommunicationHandler {
	return &CommunicationHandler{
		service: service,
	}
}

func (h *CommunicationHandler) CreateCommunication(c *gin.Context) {
	var communication domain.Communication
	if err := c.ShouldBindJSON(&communication); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	communityID := c.Param("communityId")
	if err := h.service.CreateCommunication(c.Request.Context(), communityID, &communication); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, communication)
}

func (h *CommunicationHandler) GetCommunication(c *gin.Context) {
	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

	communication, err := h.service.GetCommunication(c.Request.Context(), communityID, communicationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, communication)
}

func (h *CommunicationHandler) ListCommunications(c *gin.Context) {
	communityID := c.Param("communityId")
	filter := repository.NewFilterFromQuery(c)

	communications, total, err := h.service.ListCommunications(c.Request.Context(), communityID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"communications": communications,
		"total":          total,
	})
}

func (h *CommunicationHandler) UpdateCommunication(c *gin.Context) {
	var communication domain.Communication
	if err := c.ShouldBindJSON(&communication); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

	if err := h.service.UpdateCommunication(c.Request.Context(), communityID, communicationID, &communication); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, communication)
}

func (h *CommunicationHandler) DeleteCommunication(c *gin.Context) {
	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

	if err := h.service.DeleteCommunication(c.Request.Context(), communityID, communicationID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Communication deleted successfully"})
}

func (h *CommunicationHandler) SendCommunication(c *gin.Context) {
	communityID := c.Param("communityId")
	communicationID := c.Param("communicationId")

	if err := h.service.SendCommunication(c.Request.Context(), communityID, communicationID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Communication sent successfully"})
}

func (h *CommunicationHandler) CreateTemplate(c *gin.Context) {
	var template domain.CommunicationTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	communityID := c.Param("communityId")
	if err := h.service.CreateTemplate(c.Request.Context(), communityID, &template); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, template)
}

func (h *CommunicationHandler) GetTemplate(c *gin.Context) {
	communityID := c.Param("communityId")
	templateID := c.Param("templateId")

	template, err := h.service.GetTemplate(c.Request.Context(), communityID, templateID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, template)
}

func (h *CommunicationHandler) ListTemplates(c *gin.Context) {
	communityID := c.Param("communityId")
	filter := repository.NewFilterFromQuery(c)

	templates, total, err := h.service.ListTemplates(c.Request.Context(), communityID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"templates": templates,
		"total":     total,
	})
}

func (h *CommunicationHandler) UpdateTemplate(c *gin.Context) {
	var template domain.CommunicationTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	communityID := c.Param("communityId")
	templateID := c.Param("templateId")

	if err := h.service.UpdateTemplate(c.Request.Context(), communityID, templateID, &template); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, template)
}

func (h *CommunicationHandler) DeleteTemplate(c *gin.Context) {
	communityID := c.Param("communityId")
	templateID := c.Param("templateId")

	if err := h.service.DeleteTemplate(c.Request.Context(), communityID, templateID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Template deleted successfully"})
}

func (h *CommunicationHandler) GetCommunicationSettings(c *gin.Context) {
	communityID := c.Param("communityId")

	settings, err := h.service.GetCommunicationSettings(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}

func (h *CommunicationHandler) UpdateCommunicationSettings(c *gin.Context) {
	var settings domain.CommunicationSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	communityID := c.Param("communityId")

	if err := h.service.UpdateCommunicationSettings(c.Request.Context(), communityID, &settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}
