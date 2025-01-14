package router

import "github.com/gin-gonic/gin"

func InitUserRoutes(router *gin.RouterGroup, h RouteHandler) {
	// Rotas do perfil do usuário
	user := router.Group("/user")
	{
		user.GET("/profile", h.GetProfile)
		user.PUT("/profile", h.UpdateProfile)
		user.PUT("/password", h.UpdatePassword)
		user.PUT("/avatar", h.UpdateAvatar)
	}

	// Rota para listar usuários
	router.GET("/users", h.ListUsers)
}
