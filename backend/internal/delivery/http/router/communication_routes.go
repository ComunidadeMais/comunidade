package router

import "github.com/gin-gonic/gin"

func InitCommunicationRoutes(router *gin.RouterGroup, h RouteHandler) {
	communications := router.Group("/:communityId/communications")
	{
		communications.POST("", h.CreateCommunication)
		communications.GET("", h.ListCommunications)
		communications.GET("/:communicationId", h.GetCommunication)
		communications.PUT("/:communicationId", h.UpdateCommunication)
		communications.DELETE("/:communicationId", h.DeleteCommunication)
		communications.POST("/:communicationId/send", h.SendCommunication)

		communications.POST("/templates", h.CreateTemplate)
		communications.GET("/templates", h.ListTemplates)
		communications.GET("/templates/:templateId", h.GetTemplate)
		communications.PUT("/templates/:templateId", h.UpdateTemplate)
		communications.DELETE("/templates/:templateId", h.DeleteTemplate)

		communications.GET("/settings", h.GetCommunicationSettings)
		communications.POST("/settings", h.CreateCommunicationSettings)
		communications.PUT("/settings", h.UpdateCommunicationSettings)
		communications.POST("/test-email", h.TestEmail)
	}
}
