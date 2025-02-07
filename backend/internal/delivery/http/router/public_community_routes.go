package router

import (
	"github.com/gin-gonic/gin"
)

func InitPublicCommunityRoutes(router *gin.RouterGroup, h RouteHandler) {
	router.GET("/communities/:communityId/public", h.GetPublicCommunityData)

	// Rotas de autenticação de membros
	members := router.Group("/communities/:communityId/members")
	{
		members.POST("/signup", h.MemberSignUp)
		members.POST("/login", h.MemberLogin)
		members.POST("/forgot-password", h.MemberForgotPassword)
		members.POST("/:memberId/reset-password", h.MemberResetPassword)
	}
}
