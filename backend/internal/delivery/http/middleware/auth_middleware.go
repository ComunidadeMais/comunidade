package middleware

import "github.com/gin-gonic/gin"

// AuthMiddleware define os métodos necessários para autenticação
type AuthMiddleware interface {
	// RequireAuth retorna um middleware que requer autenticação
	RequireAuth() gin.HandlerFunc

	// RequireRole retorna um middleware que requer um papel específico
	RequireRole(role string) gin.HandlerFunc

	// RequireCommunityRole retorna um middleware que requer um papel específico em uma comunidade
	RequireCommunityRole(role string) gin.HandlerFunc

	// RequireGroupRole retorna um middleware que requer um papel específico em um grupo
	RequireGroupRole(role string) gin.HandlerFunc
}
