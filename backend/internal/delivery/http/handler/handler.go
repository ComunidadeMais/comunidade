package handler

import (
	"context"
	"errors"

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
	CheckIn       service.CheckInService
	Asaas         *service.AsaasService
}

func NewHandler(r *gin.Engine, repos *repository.Repositories, logger *zap.Logger) {
	services := &Services{
		Upload:        service.NewUploadService("./uploads"),
		Communication: service.NewCommunicationService(repos, logger),
		CheckIn:       service.NewCheckInService(repos.CheckIn, repos.Member, repos.Event),
		Asaas:         service.NewAsaasService(repos, logger),
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

func (h *Handler) checkUserPermission(ctx context.Context, userID string, communityID string) error {
	member, err := h.repos.Member.FindByID(ctx, communityID, userID)
	if err != nil {
		return err
	}
	if member == nil {
		return errors.New("user is not a member of this community")
	}
	if !member.IsAdmin() {
		return errors.New("user does not have admin permission")
	}
	return nil
}

type RouteHandler interface {
	// Auth
	SignUp(c *gin.Context)
	SignIn(c *gin.Context)
	SignOut(c *gin.Context)
	RefreshToken(c *gin.Context)
	ForgotPassword(c *gin.Context)
	ResetPassword(c *gin.Context)
	VerifyEmail(c *gin.Context)
	ResendVerificationEmail(c *gin.Context)

	// Communities
	AddCommunity(c *gin.Context)
	GetCommunity(c *gin.Context)
	ListCommunities(c *gin.Context)
	UpdateCommunity(c *gin.Context)
	DeleteCommunity(c *gin.Context)
	GetCommunityMembers(c *gin.Context)
	AddCommunityMember(c *gin.Context)
	UpdateCommunityMember(c *gin.Context)
	DeleteCommunityMember(c *gin.Context)

	// Donations
	AddAsaasConfig(c *gin.Context)
	GetAsaasConfig(c *gin.Context)
	UpdateAsaasConfig(c *gin.Context)
	AddAsaasAccount(c *gin.Context)
	ListAsaasAccounts(c *gin.Context)
	GetAsaasAccount(c *gin.Context)
	UpdateAsaasAccount(c *gin.Context)
	DeleteAsaasAccount(c *gin.Context)
	RefreshAccount(c *gin.Context)
	AddCampaign(c *gin.Context)
	ListCampaigns(c *gin.Context)
	AddDonation(c *gin.Context)
	ListDonations(c *gin.Context)
	AddRecurringDonation(c *gin.Context)
	ListRecurringDonations(c *gin.Context)

	// Webhooks
	HandleAsaasAccountStatusWebhook(c *gin.Context)
}
