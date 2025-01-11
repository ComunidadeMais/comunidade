package router

import (
	"github.com/gin-gonic/gin"
)

func InitRoutes(r *gin.Engine, h RouteHandler, authMiddleware gin.HandlerFunc) {
	// Configura o servidor de arquivos estáticos
	r.Static("/uploads", "./uploads")

	api := r.Group("/api/v1")

	// Rotas públicas
	InitAuthRoutes(api, h)

	// Rotas protegidas
	protected := api.Group("")
	protected.Use(authMiddleware)
	{
		InitUserRoutes(protected, h)
		InitCommunityRoutes(protected, h)
		InitMemberRoutes(protected, h)
		InitFamilyRoutes(protected, h)
		InitGroupRoutes(protected, h)
		InitEventRoutes(protected, h)
	}
}
