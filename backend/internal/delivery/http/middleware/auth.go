package middleware

import (
	"net/http"
	"strings"

	"github.com/comunidade/backend/internal/config"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

func Auth(repos *repository.Repositories, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obtém o token do header Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
			c.Abort()
			return
		}

		// Remove o prefixo "Bearer "
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Carrega a configuração
		cfg, err := config.Load()
		if err != nil {
			logger.Error("erro ao carregar configuração", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro de configuração do servidor"})
			c.Abort()
			return
		}

		// Valida o token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWT.Secret), nil
		})
		if err != nil {
			logger.Error("erro ao validar token", zap.Error(err))
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		// Obtém o ID do usuário do token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		// Busca o usuário no banco de dados
		user, err := repos.User.FindByID(c.Request.Context(), userID)
		if err != nil {
			logger.Error("erro ao buscar usuário", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			c.Abort()
			return
		}
		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
			c.Abort()
			return
		}

		// Adiciona o usuário ao contexto
		c.Set("user", user)
		c.Next()
	}
}

// RequireRole retorna um middleware que verifica o papel do usuário
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "usuário não autenticado",
			})
			return
		}

		userRole := role.(string)
		for _, r := range roles {
			if userRole == r {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error": "acesso negado",
		})
	}
}

// RequireCommunity retorna um middleware que verifica se o usuário pertence à comunidade
func RequireCommunity() gin.HandlerFunc {
	return func(c *gin.Context) {
		communityID, exists := c.Get("community_id")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "usuário não autenticado",
			})
			return
		}

		if communityID.(string) == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "usuário não pertence a nenhuma comunidade",
			})
			return
		}

		c.Next()
	}
}
