package router

import (
	"github.com/gin-gonic/gin"
)

func InitRoutes(r *gin.Engine, h RouteHandler, authMiddleware gin.HandlerFunc) {
	// Configura o servidor de arquivos estáticos
	r.Static("/uploads", "./uploads")

	api := r.Group("/api/v1")

	// Rotas públicas (sem autenticação)
	public := api.Group("")
	{
		InitAuthRoutes(public, h)
		InitPublicEventRoutes(public, h)
		InitPublicCheckInRoutes(public, h)
	}

	// Rotas protegidas (com autenticação)
	protected := api.Group("")
	protected.Use(authMiddleware)
	{
		InitUserRoutes(protected, h)
		InitCommunityRoutes(protected, h)
		InitMemberRoutes(protected, h)
		InitFamilyRoutes(protected, h)
		InitGroupRoutes(protected, h)
		InitEventRoutes(protected, h)
		InitCheckInRoutes(protected, h)
		InitCommunicationRoutes(protected, h)
		InitFinancialRoutes(protected, h)
		InitDonationRoutes(protected, h)
	}
}
