package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/comunidade/backend/pkg/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RecoveryMiddleware retorna um middleware de recuperação de pânico
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				stack := debug.Stack()
				logger.Error("panic recovered",
					zap.Any("error", err),
					zap.String("stack", string(stack)),
				)

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": fmt.Sprintf("erro interno do servidor: %v", err),
				})
			}
		}()

		c.Next()
	}
}
