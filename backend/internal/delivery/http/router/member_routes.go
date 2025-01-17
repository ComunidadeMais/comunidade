package router

import "github.com/gin-gonic/gin"

func InitMemberRoutes(router *gin.RouterGroup, h RouteHandler) {
	members := router.Group("/:communityId/members")
	{
		members.POST("", h.AddMember)
		members.GET("", h.ListMembers)
		members.GET("/search", h.SearchMember)
		members.GET("/:memberId", h.GetMember)
		members.PUT("/:memberId", h.UpdateMember)
		members.DELETE("/:memberId", h.RemoveMember)
		members.POST("/:memberId/photo", h.UploadMemberPhoto)
		members.GET("/:memberId/family", h.GetMemberFamily)
	}
}
