package router

import "github.com/gin-gonic/gin"

func InitFamilyRoutes(router *gin.RouterGroup, h RouteHandler) {
	families := router.Group("/:communityId/families")
	{
		families.GET("", h.ListFamilies)
		families.GET("/:familyId", h.GetFamily)
		families.POST("", h.AddFamily)
		families.PUT("/:familyId", h.UpdateFamily)
		families.DELETE("/:familyId", h.DeleteFamily)
		families.POST("/:familyId/members", h.AddFamilyMember)
		families.DELETE("/:familyId/members/:memberId", h.RemoveFamilyMember)
		families.PUT("/:familyId/members/:memberId/role", h.UpdateFamilyMemberRole)
	}
}
