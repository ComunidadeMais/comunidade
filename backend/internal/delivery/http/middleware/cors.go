package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	config := cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"https://comunidade-git-main-hugohenricks-projects.vercel.app",
			"https://comunidade-three.vercel.app",
			"https://comunidade-hugohenricks-projects.vercel.app",
			"https://comunidademais.app",
			"https://www.comunidademais.app",
			"https://comunidademais.com",
			"https://www.comunidademais.com",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}
	return cors.New(config)
}
