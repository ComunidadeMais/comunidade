package router

import "github.com/gin-gonic/gin"

func InitGroupRoutes(router *gin.RouterGroup, h RouteHandler) {
	groups := router.Group("/:communityId/groups")
	{
		groups.POST("", h.CreateGroup)
		groups.GET("", h.ListGroups)

		groups.GET("/:groupId", h.GetGroup)
		groups.PUT("/:groupId", h.UpdateGroup)
		groups.DELETE("/:groupId", h.DeleteGroup)
		groups.GET("/:groupId/members", h.ListGroupMembers)
		groups.POST("/:groupId/members/:memberId", h.AddGroupMember)
		groups.DELETE("/:groupId/members/:memberId", h.RemoveGroupMember)
	}
}
