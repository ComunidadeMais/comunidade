package router

import "github.com/gin-gonic/gin"

func InitCommunityRoutes(router *gin.RouterGroup, h RouteHandler) {
	communities := router.Group("/communities")
	{
		communities.POST("", h.CreateCommunity)
		communities.GET("", h.ListCommunities)
		communities.GET("/:communityId", h.GetCommunity)
		communities.PUT("/:communityId", h.UpdateCommunity)
		communities.DELETE("/:communityId", h.DeleteCommunity)
		communities.POST("/:communityId/logo", h.UploadCommunityLogo)
		communities.POST("/:communityId/banner", h.UploadCommunityBanner)

		InitMemberRoutes(communities, h)
		InitFamilyRoutes(communities, h)
		InitGroupRoutes(communities, h)
		InitEventRoutes(communities, h)
		InitCommunicationRoutes(communities, h)
	}
}
