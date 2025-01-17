package router

import "github.com/gin-gonic/gin"

func InitCheckInRoutes(router *gin.RouterGroup, h RouteHandler) {
	// Rotas de check-in
	checkIn := router.Group("/events/:eventId/checkin")
	{
		checkIn.POST("", h.CreateCheckIn)
		checkIn.GET("", h.GetEventCheckIns)
		checkIn.GET("/stats", h.GetEventStats)
	}
}
