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

func MemberAuth(repos *repository.Repositories, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not provided"})
			c.Abort()
			return
		}

		// Remove "Bearer " prefix
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Load configuration
		cfg, err := config.Load()
		if err != nil {
			logger.Error("error loading config", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
			c.Abort()
			return
		}

		// Validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWT.Secret), nil
		})
		if err != nil {
			logger.Error("error validating token", zap.Error(err))
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Get member ID from token
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		memberID, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		communityID := c.Param("communityId")
		if communityID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Community ID is required"})
			c.Abort()
			return
		}

		// Find member in database
		member, err := repos.Member.FindByID(c.Request.Context(), communityID, memberID)
		if err != nil {
			logger.Error("error finding member",
				zap.Error(err),
				zap.String("member_id", memberID),
				zap.String("community_id", communityID),
			)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			c.Abort()
			return
		}
		if member == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Member not found"})
			c.Abort()
			return
		}

		// Add member to context
		c.Set("member", member)
		c.Set("memberId", memberID)
		c.Set("communityId", communityID)
		c.Next()
	}
}
