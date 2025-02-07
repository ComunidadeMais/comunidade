package interfaces

import (
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type Handler interface {
	GetRepos() *repository.Repositories
	GetLogger() *zap.Logger

	// Member methods
	MemberSignUp(c *gin.Context)
	MemberLogin(c *gin.Context)
	MemberForgotPassword(c *gin.Context)
	MemberResetPassword(c *gin.Context)
	GetCurrentMember(c *gin.Context)
	ListMembers(c *gin.Context)
	GetMember(c *gin.Context)
	UpdateMember(c *gin.Context)
	RemoveMember(c *gin.Context)
	UploadMemberPhoto(c *gin.Context)
	GetMemberFamily(c *gin.Context)
}

// BaseHandler provides common functionality for handlers
type BaseHandler struct {
	logger *zap.Logger
	repos  *repository.Repositories
}

func (h *BaseHandler) GetLogger() *zap.Logger {
	return h.logger
}

func (h *BaseHandler) GetRepos() *repository.Repositories {
	return h.repos
}

func NewBaseHandler(repos *repository.Repositories, logger *zap.Logger) *BaseHandler {
	return &BaseHandler{
		repos:  repos,
		logger: logger,
	}
}
