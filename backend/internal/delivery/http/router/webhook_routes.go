package router

import "github.com/gin-gonic/gin"

func InitWebhookRoutes(router *gin.RouterGroup, h RouteHandler) {
	webhooks := router.Group("/webhooks")
	{
		// Webhooks do ASAAS
		webhooks.POST("/asaas/account-status", h.HandleAsaasAccountStatusWebhook)
	}
}
