package service

import (
	"context"
	"fmt"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"go.uber.org/zap"
)

type EngagementService struct {
	repos  *repository.Repositories
	logger *zap.Logger
}

type MemberDashboard struct {
	Member          *domain.Member              `json:"member"`
	RecentEvents    []*domain.Event             `json:"recent_events"`
	UpcomingEvents  []*domain.Event             `json:"upcoming_events"`
	Groups          []*domain.Group             `json:"groups"`
	Achievements    []*domain.MemberAchievement `json:"achievements"`
	RecentDonations []*domain.Donation          `json:"recent_donations"`
	EngagementScore int                         `json:"engagement_score"`
	MonthlyGoals    map[string]int              `json:"monthly_goals"`
	RecentPosts     []*domain.CommunityPost     `json:"recent_posts"`
}

func NewEngagementService(repos *repository.Repositories, logger *zap.Logger) *EngagementService {
	return &EngagementService{
		repos:  repos,
		logger: logger,
	}
}

// GetMemberDashboard retorna os dados do dashboard do membro
func (s *EngagementService) GetMemberDashboard(ctx context.Context, communityID, memberID string) (*MemberDashboard, error) {
	// Busca o membro
	member, err := s.repos.Member.FindByID(ctx, communityID, memberID)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar membro: %v", err)
	}
	if member == nil {
		return nil, fmt.Errorf("membro não encontrado")
	}

	// Busca eventos recentes (últimos 30 dias)
	recentEvents, err := s.getRecentEvents(ctx, communityID, memberID)
	if err != nil {
		s.logger.Error("erro ao buscar eventos recentes", zap.Error(err))
	}

	// Busca próximos eventos
	upcomingEvents, err := s.getUpcomingEvents(ctx, communityID)
	if err != nil {
		s.logger.Error("erro ao buscar próximos eventos", zap.Error(err))
	}

	// Busca grupos do membro
	groups, _, err := s.repos.Group.List(ctx, communityID, &repository.Filter{
		Search: fmt.Sprintf("member_id = '%s'", memberID),
	})
	if err != nil {
		s.logger.Error("erro ao buscar grupos", zap.Error(err))
	}

	// Busca conquistas
	achievements, err := s.getMemberAchievements(ctx, memberID)
	if err != nil {
		s.logger.Error("erro ao buscar conquistas", zap.Error(err))
	}

	// Busca doações recentes
	donations, err := s.getRecentDonations(ctx, communityID, memberID)
	if err != nil {
		s.logger.Error("erro ao buscar doações", zap.Error(err))
	}

	// Calcula pontuação de engajamento
	score := s.calculateEngagementScore(ctx, member, recentEvents, donations)

	// Busca metas mensais
	goals := s.getMonthlyGoals(ctx, member)

	// Busca posts recentes
	posts, err := s.getRecentPosts(ctx, communityID)
	if err != nil {
		s.logger.Error("erro ao buscar posts", zap.Error(err))
	}

	return &MemberDashboard{
		Member:          member,
		RecentEvents:    recentEvents,
		UpcomingEvents:  upcomingEvents,
		Groups:          groups,
		Achievements:    achievements,
		RecentDonations: donations,
		EngagementScore: score,
		MonthlyGoals:    goals,
		RecentPosts:     posts,
	}, nil
}

// Métodos auxiliares

func (s *EngagementService) getRecentEvents(ctx context.Context, communityID, memberID string) ([]*domain.Event, error) {
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	filter := &repository.Filter{
		Search:   fmt.Sprintf("member_id = '%s' AND start_date >= '%s'", memberID, thirtyDaysAgo.Format("2006-01-02")),
		OrderBy:  "start_date",
		OrderDir: "DESC",
		PerPage:  5,
	}
	events, _, err := s.repos.Event.List(ctx, communityID, filter)
	return events, err
}

func (s *EngagementService) getUpcomingEvents(ctx context.Context, communityID string) ([]*domain.Event, error) {
	now := time.Now()
	filter := &repository.Filter{
		Search:   fmt.Sprintf("start_date >= '%s'", now.Format("2006-01-02")),
		OrderBy:  "start_date",
		OrderDir: "ASC",
		PerPage:  5,
	}
	events, _, err := s.repos.Event.List(ctx, communityID, filter)
	return events, err
}

func (s *EngagementService) getMemberAchievements(ctx context.Context, memberID string) ([]*domain.MemberAchievement, error) {
	achievements, _, err := s.repos.Engagement.ListAchievements(ctx, memberID, &repository.Filter{
		OrderBy:  "earned_at",
		OrderDir: "DESC",
	})
	return achievements, err
}

func (s *EngagementService) getRecentDonations(ctx context.Context, communityID, memberID string) ([]*domain.Donation, error) {
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	filter := &repository.Filter{
		Search:   fmt.Sprintf("member_id = '%s' AND created_at >= '%s'", memberID, thirtyDaysAgo.Format("2006-01-02")),
		OrderBy:  "created_at",
		OrderDir: "DESC",
		PerPage:  5,
	}
	donations, err := s.repos.Donation.List(ctx, communityID, filter)
	return donations, err
}

func (s *EngagementService) calculateEngagementScore(ctx context.Context, member *domain.Member, events []*domain.Event, donations []*domain.Donation) int {
	score := 0

	// Pontos por evento participado
	score += len(events) * 10

	// Pontos por doação realizada
	score += len(donations) * 5

	// Pontos por grupo que participa
	if member.Groups != nil {
		score += len(member.Groups) * 15
	}

	// Pontos por ministério
	if member.Ministry != "" {
		score += 20
	}

	// Pontos por voluntariado
	if member.IsVolunteer {
		score += 25
	}

	return score
}

func (s *EngagementService) getMonthlyGoals(ctx context.Context, member *domain.Member) map[string]int {
	goals := make(map[string]int)

	// Define metas mensais
	goals["events"] = 3    // Participar de 3 eventos
	goals["donations"] = 1 // Realizar 1 doação
	goals["prayers"] = 5   // Fazer 5 pedidos de oração
	goals["posts"] = 2     // Fazer 2 postagens

	return goals
}

func (s *EngagementService) getRecentPosts(ctx context.Context, communityID string) ([]*domain.CommunityPost, error) {
	posts, _, err := s.repos.Engagement.ListPosts(ctx, communityID, &repository.Filter{
		OrderBy:  "created_at",
		OrderDir: "DESC",
		PerPage:  5,
	})
	return posts, err
}

// AwardAchievement concede uma nova conquista ao membro
func (s *EngagementService) AwardAchievement(ctx context.Context, memberID, badgeName string, points int) error {
	achievement := &domain.MemberAchievement{
		MemberID:  memberID,
		BadgeName: badgeName,
		Points:    points,
		EarnedAt:  time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return s.repos.Engagement.CreateAchievement(ctx, achievement)
}

// Novos métodos para gerenciar posts

func (s *EngagementService) CreatePost(ctx context.Context, communityID string, post *domain.CommunityPost) error {
	post.CommunityID = communityID
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	return s.repos.Engagement.CreatePost(ctx, post)
}

func (s *EngagementService) GetPost(ctx context.Context, communityID, postID string) (*domain.CommunityPost, error) {
	return s.repos.Engagement.FindPostByID(ctx, communityID, postID)
}

func (s *EngagementService) UpdatePost(ctx context.Context, communityID string, post *domain.CommunityPost) error {
	post.UpdatedAt = time.Now()
	return s.repos.Engagement.UpdatePost(ctx, post)
}

func (s *EngagementService) DeletePost(ctx context.Context, communityID, postID string) error {
	return s.repos.Engagement.DeletePost(ctx, communityID, postID)
}

func (s *EngagementService) ListPosts(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.CommunityPost, int64, error) {
	return s.repos.Engagement.ListPosts(ctx, communityID, filter)
}

// Métodos para gerenciar comentários

func (s *EngagementService) CreateComment(ctx context.Context, comment *domain.PostComment) error {
	comment.CreatedAt = time.Now()
	comment.UpdatedAt = time.Now()
	return s.repos.Engagement.CreateComment(ctx, comment)
}

func (s *EngagementService) UpdateComment(ctx context.Context, comment *domain.PostComment) error {
	comment.UpdatedAt = time.Now()
	return s.repos.Engagement.UpdateComment(ctx, comment)
}

func (s *EngagementService) DeleteComment(ctx context.Context, postID, commentID string) error {
	return s.repos.Engagement.DeleteComment(ctx, postID, commentID)
}

func (s *EngagementService) ListComments(ctx context.Context, postID string, filter *repository.Filter) ([]*domain.PostComment, int64, error) {
	return s.repos.Engagement.ListComments(ctx, postID, filter)
}

// Métodos para gerenciar reações

func (s *EngagementService) CreateReaction(ctx context.Context, reaction *domain.PostReaction) error {
	reaction.CreatedAt = time.Now()
	return s.repos.Engagement.CreateReaction(ctx, reaction)
}

func (s *EngagementService) DeleteReaction(ctx context.Context, postID, memberID string) error {
	return s.repos.Engagement.DeleteReaction(ctx, postID, memberID)
}

func (s *EngagementService) ListReactions(ctx context.Context, postID string) ([]*domain.PostReaction, error) {
	return s.repos.Engagement.ListReactions(ctx, postID)
}

// Métodos para gerenciar pedidos de oração

func (s *EngagementService) CreatePrayerRequest(ctx context.Context, communityID string, prayer *domain.PrayerRequest) error {
	prayer.CommunityID = communityID
	prayer.CreatedAt = time.Now()
	prayer.UpdatedAt = time.Now()
	return s.repos.Engagement.CreatePrayerRequest(ctx, prayer)
}

func (s *EngagementService) GetPrayerRequest(ctx context.Context, communityID, prayerID string) (*domain.PrayerRequest, error) {
	return s.repos.Engagement.FindPrayerRequestByID(ctx, communityID, prayerID)
}

func (s *EngagementService) UpdatePrayerRequest(ctx context.Context, communityID string, prayer *domain.PrayerRequest) error {
	prayer.UpdatedAt = time.Now()
	return s.repos.Engagement.UpdatePrayerRequest(ctx, prayer)
}

func (s *EngagementService) DeletePrayerRequest(ctx context.Context, communityID, prayerID string) error {
	return s.repos.Engagement.DeletePrayerRequest(ctx, communityID, prayerID)
}

func (s *EngagementService) ListPrayerRequests(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.PrayerRequest, int64, error) {
	return s.repos.Engagement.ListPrayerRequests(ctx, communityID, filter)
}
