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
	Engagement    *service.EngagementService
}

func NewHandler(r *gin.Engine, repos *repository.Repositories, logger *zap.Logger) {
	services := &Services{
		Upload:        service.NewUploadService("./uploads"),
		Communication: service.NewCommunicationService(repos, logger),
		CheckIn:       service.NewCheckInService(repos.CheckIn, repos.Member, repos.Event),
		Asaas:         service.NewAsaasService(repos, logger),
		Engagement:    service.NewEngagementService(repos, logger),
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

func (h *Handler) GetLogger() *zap.Logger {
	return h.logger
}

func (h *Handler) GetRepos() *repository.Repositories {
	return h.repos
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

	// Member Auth
	MemberSignUp(c *gin.Context)
	MemberLogin(c *gin.Context)
	MemberForgotPassword(c *gin.Context)
	MemberResetPassword(c *gin.Context)

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
	GetPublicCommunityData(c *gin.Context)

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

	// Engagement
	GetMemberDashboard(c *gin.Context)
	CreatePost(c *gin.Context)
	GetPost(c *gin.Context)
	UpdatePost(c *gin.Context)
	DeletePost(c *gin.Context)
	ListPosts(c *gin.Context)
	CreateComment(c *gin.Context)
	DeleteComment(c *gin.Context)
	CreateReaction(c *gin.Context)
	DeleteReaction(c *gin.Context)
	CreatePrayerRequest(c *gin.Context)
	UpdatePrayerRequest(c *gin.Context)
	DeletePrayerRequest(c *gin.Context)
	ListPrayerRequests(c *gin.Context)
}
