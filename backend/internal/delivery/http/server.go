package http

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/comunidade/backend/internal/delivery/http/handler"
	"github.com/comunidade/backend/internal/delivery/http/middleware"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type Server struct {
	router *gin.Engine
	logger *zap.Logger
}

func NewServer(repos *repository.Repositories, logger *zap.Logger) *Server {
	router := gin.Default()

	// Adiciona middleware CORS
	router.Use(middleware.CORS())

	// Adiciona middleware de logging
	router.Use(middleware.Logger(logger))

	// Cria o diretório de uploads se não existir
	uploadsDir := "./uploads/posts"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		logger.Error("Erro ao criar diretório de uploads", zap.Error(err))
	}

	// Configura as rotas
	handler.NewHandler(router, repos, logger)

	// Configura o servidor para servir arquivos estáticos dentro do grupo /api/v1
	apiGroup := router.Group("/api/v1")
	apiGroup.Static("/uploads", "./uploads")

	return &Server{
		router: router,
		logger: logger,
	}
}

func (s *Server) Start(ctx context.Context, addr string) error {
	srv := &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	// Canal para receber erros do servidor
	errChan := make(chan error, 1)

	go func() {
		s.logger.Info(fmt.Sprintf("Starting server on %s", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errChan <- fmt.Errorf("failed to start server: %w", err)
		}
	}()

	select {
	case <-ctx.Done():
		s.logger.Info("Shutting down server...")
		if err := srv.Shutdown(context.Background()); err != nil {
			return fmt.Errorf("failed to shutdown server: %w", err)
		}
		return nil
	case err := <-errChan:
		return err
	}
}
