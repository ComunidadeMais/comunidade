package middleware

import (
	"net/http"
	"strings"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

type JWTMiddleware struct {
	authUseCase usecase.AuthUseCase
}

func NewJWTMiddleware(authUseCase usecase.AuthUseCase) AuthMiddleware {
	return &JWTMiddleware{
		authUseCase: authUseCase,
	}
}

func (m *JWTMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extrai o token do cabeçalho Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header is required"})
			c.Abort()
			return
		}

		// Verifica se o token está no formato correto
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		// Valida o token
		claims, err := m.authUseCase.ValidateToken(c.Request.Context(), parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		// Armazena as claims no contexto
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func (m *JWTMiddleware) RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Primeiro executa o middleware de autenticação
		m.RequireAuth()(c)
		if c.IsAborted() {
			return
		}

		// Verifica o papel do usuário
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "role not found in context"})
			c.Abort()
			return
		}

		if userRole != role && userRole != domain.RoleSuperAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func (m *JWTMiddleware) RequireCommunityRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Primeiro executa o middleware de autenticação
		m.RequireAuth()(c)
		if c.IsAborted() {
			return
		}

		// Obtém o ID do usuário e da comunidade
		userID, _ := c.Get("user_id")
		communityID := c.Param("communityID")

		// Verifica o papel do usuário na comunidade
		member, err := m.authUseCase.GetMemberRole(c.Request.Context(), communityID, userID.(string))
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "user is not a member of this community"})
			c.Abort()
			return
		}

		if member.Role != role && member.Role != domain.RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions in this community"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func (m *JWTMiddleware) RequireGroupRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Primeiro executa o middleware de autenticação
		m.RequireAuth()(c)
		if c.IsAborted() {
			return
		}

		// Obtém o ID do usuário e do grupo
		userID, _ := c.Get("user_id")
		groupID := c.Param("groupID")

		// Verifica o papel do usuário no grupo
		member, err := m.authUseCase.GetGroupRole(c.Request.Context(), groupID, userID.(string))
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "user is not a member of this group"})
			c.Abort()
			return
		}

		if member.Role != role && member.Role != domain.RoleLeader {
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions in this group"})
			c.Abort()
			return
		}

		c.Next()
	}
}
