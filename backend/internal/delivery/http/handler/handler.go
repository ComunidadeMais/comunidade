package handler

import (
	"github.com/comunidade/backend/internal/delivery/http/middleware"
	"github.com/comunidade/backend/internal/delivery/http/router"
	"github.com/comunidade/backend/internal/repository"
	"github.com/comunidade/backend/internal/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type Handler struct {
	repos    *repository.Repositories
	logger   *zap.Logger
	services *Services
}

type Services struct {
	Upload        *service.UploadService
	Communication service.CommunicationService
}

func NewHandler(r *gin.Engine, repos *repository.Repositories, logger *zap.Logger) {
	services := &Services{
		Upload:        service.NewUploadService("./uploads"),
		Communication: service.NewCommunicationService(repos, logger),
	}

	h := &Handler{
		repos:    repos,
		logger:   logger,
		services: services,
	}

	router.InitRoutes(r, h, h.authMiddleware())
}

func (h *Handler) authMiddleware() gin.HandlerFunc {
	return middleware.Auth(h.repos, h.logger)
}
