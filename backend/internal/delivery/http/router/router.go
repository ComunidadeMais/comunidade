package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRoutes(r *gin.Engine, h RouteHandler, authMiddleware gin.HandlerFunc) {
	// Configuração do CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Configura o servidor de arquivos estáticos
	r.Static("/uploads", "./uploads")

	// API v1
	v1 := r.Group("/api/v1")

	// Rotas públicas (sem autenticação)
	public := v1.Group("")
	{
		InitAuthRoutes(public, h)
		InitPublicEventRoutes(public, h)
		InitPublicCheckInRoutes(public, h)
		InitPublicCommunityRoutes(public, h)
	}

	// Rotas protegidas (com autenticação)
	protected := v1.Group("")
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
		InitEngagementRoutes(protected, h)
	}

	// Webhooks
	InitWebhookRoutes(v1, h)
}
