package router

import "github.com/gin-gonic/gin"

func InitPublicCheckInRoutes(router *gin.RouterGroup, h RouteHandler) {
	// Rotas públicas de check-in
	router.GET("/events/:eventId/checkin/public", h.GetPublicEvent)            // Usa o mesmo handler do evento público
	router.POST("/events/:eventId/checkin", h.CreateCheckIn)                   // Permite criar check-in sem autenticação
	router.GET("/events/:eventId/members/search", h.SearchMember)              // Busca membro por email/telefone
	router.GET("/events/:eventId/members/:memberId/family", h.GetMemberFamily) // Busca família do membro
}

func InitCheckInRoutes(router *gin.RouterGroup, h RouteHandler) {
	// Rotas protegidas de check-in (dashboard e estatísticas)
	checkIn := router.Group("/events/:eventId/checkin")
	{
		checkIn.GET("/list", h.GetEventCheckIns) // Lista de check-ins (protegido)
		checkIn.GET("/stats", h.GetEventStats)   // Estatísticas do evento (protegido)
	}
}
