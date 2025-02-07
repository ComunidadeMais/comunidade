package router

import (
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RouteHandler define os métodos necessários para as rotas
type RouteHandler interface {
	GetLogger() *zap.Logger
	GetRepos() *repository.Repositories

	// Auth
	Register(c *gin.Context)
	Login(c *gin.Context)
	RefreshToken(c *gin.Context)
	ForgotPassword(c *gin.Context)
	ResetPassword(c *gin.Context)
	ChangePassword(c *gin.Context)

	// Member Auth
	MemberSignUp(c *gin.Context)
	MemberLogin(c *gin.Context)
	MemberForgotPassword(c *gin.Context)
	MemberResetPassword(c *gin.Context)

	// User
	GetProfile(c *gin.Context)
	UpdateProfile(c *gin.Context)
	UpdatePassword(c *gin.Context)
	UpdateAvatar(c *gin.Context)
	ListUsers(c *gin.Context)

	// Community
	CreateCommunity(c *gin.Context)
	ListCommunities(c *gin.Context)
	GetCommunity(c *gin.Context)
	UpdateCommunity(c *gin.Context)
	DeleteCommunity(c *gin.Context)
	UploadCommunityLogo(c *gin.Context)
	UploadCommunityBanner(c *gin.Context)
	GetPublicCommunityData(c *gin.Context)

	// Member
	AddMember(c *gin.Context)
	GetCurrentMember(c *gin.Context)
	ListMembers(c *gin.Context)
	SearchMember(c *gin.Context)
	GetMember(c *gin.Context)
	UpdateMember(c *gin.Context)
	RemoveMember(c *gin.Context)
	UploadMemberPhoto(c *gin.Context)
	GetMemberFamily(c *gin.Context)

	// Family
	ListFamilies(c *gin.Context)
	GetFamily(c *gin.Context)
	AddFamily(c *gin.Context)
	UpdateFamily(c *gin.Context)
	DeleteFamily(c *gin.Context)
	AddFamilyMember(c *gin.Context)
	RemoveFamilyMember(c *gin.Context)
	UpdateFamilyMemberRole(c *gin.Context)

	// Group
	CreateGroup(c *gin.Context)
	ListGroups(c *gin.Context)
	GetGroup(c *gin.Context)
	UpdateGroup(c *gin.Context)
	DeleteGroup(c *gin.Context)
	AddGroupMember(c *gin.Context)
	RemoveGroupMember(c *gin.Context)
	ListGroupMembers(c *gin.Context)

	// Event
	CreateEvent(c *gin.Context)
	ListEvents(c *gin.Context)
	GetEvent(c *gin.Context)
	UpdateEvent(c *gin.Context)
	DeleteEvent(c *gin.Context)
	RegisterAttendance(c *gin.Context)
	UpdateAttendance(c *gin.Context)
	GetPublicEvent(c *gin.Context)
	UploadEventImage(c *gin.Context)

	// Communication methods
	CreateCommunication(c *gin.Context)
	GetCommunication(c *gin.Context)
	ListCommunications(c *gin.Context)
	UpdateCommunication(c *gin.Context)
	DeleteCommunication(c *gin.Context)
	SendCommunication(c *gin.Context)

	CreateTemplate(c *gin.Context)
	GetTemplate(c *gin.Context)
	ListTemplates(c *gin.Context)
	UpdateTemplate(c *gin.Context)
	DeleteTemplate(c *gin.Context)

	GetCommunicationSettings(c *gin.Context)
	CreateCommunicationSettings(c *gin.Context)
	UpdateCommunicationSettings(c *gin.Context)
	TestEmail(c *gin.Context)

	// Check-in
	CreateCheckIn(c *gin.Context)
	GetEventCheckIns(c *gin.Context)
	GetEventStats(c *gin.Context)

	// Financeiro
	AddFinancialCategory(c *gin.Context)
	ListFinancialCategories(c *gin.Context)
	UpdateFinancialCategory(c *gin.Context)
	DeleteFinancialCategory(c *gin.Context)
	AddSupplier(c *gin.Context)
	ListSuppliers(c *gin.Context)
	UpdateSupplier(c *gin.Context)
	DeleteSupplier(c *gin.Context)
	AddExpense(c *gin.Context)
	ListExpenses(c *gin.Context)
	UpdateExpense(c *gin.Context)
	DeleteExpense(c *gin.Context)
	AddRevenue(c *gin.Context)
	ListRevenues(c *gin.Context)
	UpdateRevenue(c *gin.Context)
	DeleteRevenue(c *gin.Context)
	GenerateFinancialReport(c *gin.Context)
	ListFinancialReports(c *gin.Context)

	// ASAAS Integration
	AddAsaasConfig(c *gin.Context)
	GetAsaasConfig(c *gin.Context)
	UpdateAsaasConfig(c *gin.Context)

	// ASAAS Accounts
	AddAsaasAccount(c *gin.Context)
	ListAsaasAccounts(c *gin.Context)
	GetAsaasAccount(c *gin.Context)
	UpdateAsaasAccount(c *gin.Context)
	DeleteAsaasAccount(c *gin.Context)
	RefreshAccount(c *gin.Context)
	GetAsaasAccountStatus(c *gin.Context)

	// Campaigns
	AddCampaign(c *gin.Context)
	ListCampaigns(c *gin.Context)

	// Donations
	AddDonation(c *gin.Context)
	ListDonations(c *gin.Context)
	UpdateDonation(c *gin.Context)
	DeleteDonation(c *gin.Context)
	SendPaymentLink(c *gin.Context)
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

// BaseHandler implements common methods for RouteHandler
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
