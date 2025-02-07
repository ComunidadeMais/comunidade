package router

import "github.com/gin-gonic/gin"

func InitEngagementRoutes(router *gin.RouterGroup, h RouteHandler) {
	engagement := router.Group("/communities/:communityId/engagement")
	{
		// Dashboard do membro
		engagement.GET("/members/:memberId/dashboard", h.GetMemberDashboard)

		// Posts
		engagement.POST("/posts", h.CreatePost)
		engagement.GET("/posts", h.ListPosts)
		engagement.GET("/posts/:postId", h.GetPost)
		engagement.PUT("/posts/:postId", h.UpdatePost)
		engagement.DELETE("/posts/:postId", h.DeletePost)

		// Comentários
		engagement.POST("/posts/:postId/comments", h.CreateComment)
		engagement.DELETE("/posts/:postId/comments/:commentId", h.DeleteComment)

		// Reações
		engagement.POST("/posts/:postId/reactions/:type", h.CreateReaction)
		engagement.DELETE("/posts/:postId/reactions", h.DeleteReaction)

		// Pedidos de Oração
		engagement.POST("/prayers", h.CreatePrayerRequest)
		engagement.GET("/prayers", h.ListPrayerRequests)
		engagement.PUT("/prayers/:prayerId", h.UpdatePrayerRequest)
		engagement.DELETE("/prayers/:prayerId", h.DeletePrayerRequest)
	}
}
