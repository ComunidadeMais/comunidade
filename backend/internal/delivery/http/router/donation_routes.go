package router

import "github.com/gin-gonic/gin"

func InitDonationRoutes(router *gin.RouterGroup, h RouteHandler) {
	donations := router.Group("/communities/:communityId/donations")
	{
		// Configuração do Asaas
		donations.POST("/asaas/config", h.AddAsaasConfig)
		donations.GET("/asaas/config", h.GetAsaasConfig)
		donations.PUT("/asaas/config", h.UpdateAsaasConfig)

		// Gerenciamento de Contas ASAAS
		donations.POST("/asaas/accounts", h.AddAsaasAccount)
		donations.GET("/asaas/accounts", h.ListAsaasAccounts)
		donations.GET("/asaas/accounts/:accountId", h.GetAsaasAccount)
		donations.PUT("/asaas/accounts/:accountId", h.UpdateAsaasAccount)
		donations.DELETE("/asaas/accounts/:accountId", h.DeleteAsaasAccount)
		donations.POST("/asaas/accounts/:accountId/refresh", h.RefreshAccount)
		donations.GET("/asaas/accounts/:accountId/status", h.GetAsaasAccountStatus)

		// Campanhas
		donations.POST("/campaigns", h.AddCampaign)
		donations.GET("/campaigns", h.ListCampaigns)

		// Doações únicas
		donations.POST("/donations", h.AddDonation)
		donations.GET("/donations", h.ListDonations)

		// Doações recorrentes
		donations.POST("/recurring", h.AddRecurringDonation)
		donations.GET("/recurring", h.ListRecurringDonations)
	}

}
