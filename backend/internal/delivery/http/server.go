package http

import (
	"context"
	"fmt"
	"net/http"

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

	// Configura as rotas
	handler.NewHandler(router, repos, logger)

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
