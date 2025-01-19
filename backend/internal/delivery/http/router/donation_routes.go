package router

import "github.com/gin-gonic/gin"

func InitDonationRoutes(router *gin.RouterGroup, h RouteHandler) {
	donations := router.Group("/communities/:communityId/donations")
	{
		// Configuração do Asaas
		donations.POST("/asaas/config", h.AddAsaasConfig)

		// Campanhas
		donations.POST("/campaigns", h.AddCampaign)
		donations.GET("/campaigns", h.ListCampaigns)

		// Doações únicas
		donations.POST("", h.AddDonation)
		donations.GET("", h.ListDonations)

		// Doações recorrentes
		donations.POST("/recurring", h.AddRecurringDonation)
		donations.GET("/recurring", h.ListRecurringDonations)
	}
}
