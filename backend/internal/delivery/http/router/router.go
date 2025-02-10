package router

import (
	"time"

	"github.com/comunidade/backend/internal/delivery/http/middleware"
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

	// API v1
	v1 := r.Group("/api/v1")

	// Rotas públicas (sem autenticação)
	public := v1.Group("")
	{
		InitAuthRoutes(public, h)
		InitPublicEventRoutes(public, h)
		InitPublicCheckInRoutes(public, h)
		InitPublicCommunityRoutes(public, h)
		public.POST("/contact", h.HandleContactForm)
	}

	// Rotas protegidas (com autenticação administrativa)
	adminProtected := v1.Group("")
	adminProtected.Use(middleware.AdminAuth(h.GetRepos(), h.GetLogger()))
	{
		InitUserRoutes(adminProtected, h)
		InitCommunityRoutes(adminProtected, h)
		InitMemberRoutes(adminProtected, h)
		InitFamilyRoutes(adminProtected, h)
		InitGroupRoutes(adminProtected, h)
		InitEventRoutes(adminProtected, h)
		InitCheckInRoutes(adminProtected, h)
		InitCommunicationRoutes(adminProtected, h)
		InitFinancialRoutes(adminProtected, h)
		InitDonationRoutes(adminProtected, h)
	}

	// Rotas protegidas com autenticação de membro (portal do membro)
	memberProtected := v1.Group("")
	memberProtected.Use(middleware.MemberAuth(h.GetRepos(), h.GetLogger()))
	{
		InitEngagementRoutes(memberProtected, h)
		// Outras rotas específicas do portal do membro
	}

	// Webhooks (sem autenticação)
	InitWebhookRoutes(v1, h)
}
