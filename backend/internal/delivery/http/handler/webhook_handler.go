package handler

import (
	"net/http"

	"github.com/comunidade/backend/internal/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// HandleAsaasAccountStatusWebhook processa os webhooks de status da conta ASAAS
func (h *Handler) HandleAsaasAccountStatusWebhook(c *gin.Context) {
	var event struct {
		Event   string `json:"event"`
		Account struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		} `json:"account"`
	}

	if err := c.ShouldBindJSON(&event); err != nil {
		h.logger.Error("Erro ao decodificar webhook", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao decodificar webhook"})
		return
	}

	// Log do evento recebido
	h.logger.Info("Webhook de status da conta recebido",
		zap.String("event", event.Event),
		zap.String("accountID", event.Account.ID),
		zap.String("status", event.Account.Status),
	)

	// Cria uma instância do serviço
	asaasService := service.NewAsaasAccountService(h.repos, h.logger)

	// Processa o evento
	if err := asaasService.HandleAccountStatusWebhook(c.Request.Context(), event); err != nil {
		h.logger.Error("Erro ao processar webhook", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar webhook"})
		return
	}

	c.Status(http.StatusOK)
}
