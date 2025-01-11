package router

import "github.com/gin-gonic/gin"

func InitAuthRoutes(router *gin.RouterGroup, h RouteHandler) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.RefreshToken)
		auth.POST("/forgot-password", h.ForgotPassword)
		auth.POST("/reset-password", h.ResetPassword)
	}
}
