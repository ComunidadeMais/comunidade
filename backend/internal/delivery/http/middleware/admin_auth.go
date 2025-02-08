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

// AdminAuth é o middleware para autenticação administrativa
func AdminAuth(repos *repository.Repositories, logger *zap.Logger) gin.HandlerFunc {
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

		// Obtém as claims do token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		// Obtém o ID do usuário administrativo
		adminUserID, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		// Verifica se é um token administrativo
		// role, ok := claims["role"].(string)
		// if !ok || role != "admin" {
		// 	c.JSON(http.StatusForbidden, gin.H{"error": "Acesso permitido apenas para administradores"})
		// 	c.Abort()
		// 	return
		// }

		// Busca o usuário administrativo
		adminUser, err := repos.User.FindByID(c.Request.Context(), adminUserID)
		if err != nil {
			logger.Error("erro ao buscar usuário administrativo", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			c.Abort()
			return
		}
		if adminUser == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário administrativo não encontrado"})
			c.Abort()
			return
		}

		// Adiciona informações ao contexto
		c.Set("user", adminUser)
		c.Set("userId", adminUserID)
		//c.Set("role", role)

		// Obtém o ID da comunidade da URL
		communityID := c.Param("communityId")
		if communityID != "" {
			c.Set("communityId", communityID)
		}

		c.Next()
	}
}
