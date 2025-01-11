package router

import "github.com/gin-gonic/gin"

func InitEventRoutes(router *gin.RouterGroup, h RouteHandler) {
	events := router.Group("/:communityId/events")
	{
		events.POST("", h.CreateEvent)
		events.GET("", h.ListEvents)
		events.GET("/:eventId", h.GetEvent)
		events.PUT("/:eventId", h.UpdateEvent)
		events.DELETE("/:eventId", h.DeleteEvent)
		events.POST("/:eventId/members/:memberId/attendance", h.RegisterAttendance)
		events.PUT("/:eventId/members/:memberId/attendance", h.UpdateAttendance)
	}
}
