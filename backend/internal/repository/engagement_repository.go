package repository

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type EngagementRepository interface {
	Repository
	// Conquistas
	CreateAchievement(ctx context.Context, achievement *domain.MemberAchievement) error
	UpdateAchievement(ctx context.Context, achievement *domain.MemberAchievement) error
	DeleteAchievement(ctx context.Context, memberID, achievementID string) error
	FindAchievementByID(ctx context.Context, memberID, achievementID string) (*domain.MemberAchievement, error)
	ListAchievements(ctx context.Context, memberID string, filter *Filter) ([]*domain.MemberAchievement, int64, error)

	// Posts
	CreatePost(ctx context.Context, post *domain.CommunityPost) error
	UpdatePost(ctx context.Context, post *domain.CommunityPost) error
	DeletePost(ctx context.Context, communityID, postID string) error
	FindPostByID(ctx context.Context, communityID, postID string) (*domain.CommunityPost, error)
	ListPosts(ctx context.Context, communityID string, filter *Filter) ([]*domain.CommunityPost, int64, error)

	// Comentários
	CreateComment(ctx context.Context, comment *domain.PostComment) error
	UpdateComment(ctx context.Context, comment *domain.PostComment) error
	DeleteComment(ctx context.Context, postID, commentID string) error
	ListComments(ctx context.Context, postID string, filter *Filter) ([]*domain.PostComment, int64, error)

	// Reações
	CreateReaction(ctx context.Context, reaction *domain.PostReaction) error
	DeleteReaction(ctx context.Context, postID, memberID string) error
	ListReactions(ctx context.Context, postID string) ([]*domain.PostReaction, error)

	// Pedidos de Oração
	CreatePrayerRequest(ctx context.Context, prayer *domain.PrayerRequest) error
	UpdatePrayerRequest(ctx context.Context, prayer *domain.PrayerRequest) error
	DeletePrayerRequest(ctx context.Context, communityID, prayerID string) error
	FindPrayerRequestByID(ctx context.Context, communityID, prayerID string) (*domain.PrayerRequest, error)
	ListPrayerRequests(ctx context.Context, communityID string, filter *Filter) ([]*domain.PrayerRequest, int64, error)
}

type engagementRepository struct {
	BaseRepository
	logger *zap.Logger
}

func NewEngagementRepository(db *gorm.DB, logger *zap.Logger) EngagementRepository {
	return &engagementRepository{
		BaseRepository: NewBaseRepository(db, logger),
		logger:         logger,
	}
}

// Implementação dos métodos de Conquistas

func (r *engagementRepository) CreateAchievement(ctx context.Context, achievement *domain.MemberAchievement) error {
	return r.GetDB().WithContext(ctx).Create(achievement).Error
}

func (r *engagementRepository) UpdateAchievement(ctx context.Context, achievement *domain.MemberAchievement) error {
	return r.GetDB().WithContext(ctx).Save(achievement).Error
}

func (r *engagementRepository) DeleteAchievement(ctx context.Context, memberID, achievementID string) error {
	return r.GetDB().WithContext(ctx).
		Where("member_id = ? AND id = ?", memberID, achievementID).
		Delete(&domain.MemberAchievement{}).Error
}

func (r *engagementRepository) FindAchievementByID(ctx context.Context, memberID, achievementID string) (*domain.MemberAchievement, error) {
	var achievement domain.MemberAchievement
	if err := r.GetDB().WithContext(ctx).
		Where("member_id = ? AND id = ?", memberID, achievementID).
		First(&achievement).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &achievement, nil
}

func (r *engagementRepository) ListAchievements(ctx context.Context, memberID string, filter *Filter) ([]*domain.MemberAchievement, int64, error) {
	var achievements []*domain.MemberAchievement
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.MemberAchievement{}).
		Where("member_id = ?", memberID)

	// Aplica o filtro
	query = ApplyFilter(query, filter)

	// Conta o total de registros
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Busca os registros
	if err := query.Find(&achievements).Error; err != nil {
		return nil, 0, err
	}

	return achievements, total, nil
}

// Implementação dos métodos de Posts

func (r *engagementRepository) CreatePost(ctx context.Context, post *domain.CommunityPost) error {
	return r.GetDB().WithContext(ctx).Create(post).Error
}

func (r *engagementRepository) UpdatePost(ctx context.Context, post *domain.CommunityPost) error {
	return r.GetDB().WithContext(ctx).Save(post).Error
}

func (r *engagementRepository) DeletePost(ctx context.Context, communityID, postID string) error {
	// Inicia uma transação
	tx := r.GetDB().WithContext(ctx).Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Exclui as reações do post
	if err := tx.Where("post_id = ?", postID).Delete(&domain.PostReaction{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Exclui os comentários do post
	if err := tx.Where("post_id = ?", postID).Delete(&domain.PostComment{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Exclui o post
	if err := tx.Where("community_id = ? AND id = ?", communityID, postID).Delete(&domain.CommunityPost{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit da transação
	return tx.Commit().Error
}

func (r *engagementRepository) FindPostByID(ctx context.Context, communityID, postID string) (*domain.CommunityPost, error) {
	var post domain.CommunityPost
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, postID).
		Preload("Author").
		Preload("Comments").
		Preload("Comments.Author").
		First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &post, nil
}

func (r *engagementRepository) ListPosts(ctx context.Context, communityID string, filter *Filter) ([]*domain.CommunityPost, int64, error) {
	var posts []*domain.CommunityPost
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.CommunityPost{}).
		Where("community_id = ?", communityID)

	// Aplica o filtro
	query = ApplyFilter(query, filter)

	// Conta o total de registros
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Busca os registros com relacionamentos
	if err := query.
		Preload("Author").
		Preload("Comments").
		Preload("Comments.Author").
		Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}

// Implementação dos métodos de Comentários

func (r *engagementRepository) CreateComment(ctx context.Context, comment *domain.PostComment) error {
	return r.GetDB().WithContext(ctx).Create(comment).Error
}

func (r *engagementRepository) UpdateComment(ctx context.Context, comment *domain.PostComment) error {
	return r.GetDB().WithContext(ctx).Save(comment).Error
}

func (r *engagementRepository) DeleteComment(ctx context.Context, postID, commentID string) error {
	return r.GetDB().WithContext(ctx).
		Where("post_id = ? AND id = ?", postID, commentID).
		Delete(&domain.PostComment{}).Error
}

func (r *engagementRepository) ListComments(ctx context.Context, postID string, filter *Filter) ([]*domain.PostComment, int64, error) {
	var comments []*domain.PostComment
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.PostComment{}).
		Where("post_id = ?", postID)

	// Aplica o filtro
	query = ApplyFilter(query, filter)

	// Conta o total de registros
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Busca os registros com relacionamentos
	if err := query.
		Preload("Author").
		Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

// Implementação dos métodos de Reações

func (r *engagementRepository) CreateReaction(ctx context.Context, reaction *domain.PostReaction) error {
	return r.GetDB().WithContext(ctx).Create(reaction).Error
}

func (r *engagementRepository) DeleteReaction(ctx context.Context, postID, memberID string) error {
	return r.GetDB().WithContext(ctx).
		Where("post_id = ? AND member_id = ?", postID, memberID).
		Delete(&domain.PostReaction{}).Error
}

func (r *engagementRepository) ListReactions(ctx context.Context, postID string) ([]*domain.PostReaction, error) {
	var reactions []*domain.PostReaction
	if err := r.GetDB().WithContext(ctx).
		Where("post_id = ?", postID).
		Preload("Member").
		Find(&reactions).Error; err != nil {
		return nil, err
	}
	return reactions, nil
}

// Implementação dos métodos de Pedidos de Oração

func (r *engagementRepository) CreatePrayerRequest(ctx context.Context, prayer *domain.PrayerRequest) error {
	return r.GetDB().WithContext(ctx).Create(prayer).Error
}

func (r *engagementRepository) UpdatePrayerRequest(ctx context.Context, prayer *domain.PrayerRequest) error {
	return r.GetDB().WithContext(ctx).Save(prayer).Error
}

func (r *engagementRepository) DeletePrayerRequest(ctx context.Context, communityID, prayerID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, prayerID).
		Delete(&domain.PrayerRequest{}).Error
}

func (r *engagementRepository) FindPrayerRequestByID(ctx context.Context, communityID, prayerID string) (*domain.PrayerRequest, error) {
	var prayer domain.PrayerRequest
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, prayerID).
		Preload("Member").
		First(&prayer).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &prayer, nil
}

func (r *engagementRepository) ListPrayerRequests(ctx context.Context, communityID string, filter *Filter) ([]*domain.PrayerRequest, int64, error) {
	var prayers []*domain.PrayerRequest
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.PrayerRequest{}).
		Where("community_id = ?", communityID)

	// Aplica o filtro
	query = ApplyFilter(query, filter)

	// Conta o total de registros
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Busca os registros com relacionamentos
	if err := query.
		Preload("Member").
		Find(&prayers).Error; err != nil {
		return nil, 0, err
	}

	return prayers, total, nil
}
