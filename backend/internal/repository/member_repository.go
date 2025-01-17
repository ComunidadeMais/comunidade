package repository

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type MemberRepository interface {
	Repository
	Create(ctx context.Context, member *domain.Member) error
	Update(ctx context.Context, member *domain.Member) error
	Delete(ctx context.Context, communityID, memberID string) error
	FindByID(ctx context.Context, communityID, memberID string) (*domain.Member, error)
	FindByEmail(ctx context.Context, communityID, email string) (*domain.Member, error)
	FindByEmailOrPhone(ctx context.Context, communityID, search string) (*domain.Member, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Member, int64, error)
}

type memberRepository struct {
	BaseRepository
	logger *zap.Logger
}

func NewMemberRepository(db *gorm.DB, logger *zap.Logger) MemberRepository {
	return &memberRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *memberRepository) Create(ctx context.Context, member *domain.Member) error {
	r.GetLogger().Debug("criando membro no repositório",
		zap.String("member_id", member.ID),
		zap.String("community_id", member.CommunityID),
		zap.String("user_id", member.UserID))

	// if member.ID == "" {
	// 	member.ID = uuid.New().String()
	// 	r.GetLogger().Debug("gerado novo ID para o membro", zap.String("member_id", member.ID))
	// }

	return r.GetDB().WithContext(ctx).Create(member).Error
}

func (r *memberRepository) Update(ctx context.Context, member *domain.Member) error {
	return r.GetDB().WithContext(ctx).Save(member).Error
}

func (r *memberRepository) Delete(ctx context.Context, communityID, memberID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, memberID).
		Delete(&domain.Member{}).Error
}

func (r *memberRepository) FindByID(ctx context.Context, communityID, memberID string) (*domain.Member, error) {
	var member domain.Member
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, memberID).
		First(&member).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &member, nil
}

func (r *memberRepository) FindByEmail(ctx context.Context, communityID, email string) (*domain.Member, error) {
	var member domain.Member
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND email = ?", communityID, email).
		First(&member).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &member, nil
}

func (r *memberRepository) FindByEmailOrPhone(ctx context.Context, communityID, search string) (*domain.Member, error) {
	var member domain.Member
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND (email = ? OR phone = ?)", communityID, search, search).
		First(&member).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &member, nil
}

func (r *memberRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Member, int64, error) {
	var members []*domain.Member
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Member{}).
		Where("community_id = ?", communityID)

	// Aplica o filtro de busca se existir
	if filter != nil && filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where(
			"name ILIKE ? OR email ILIKE ? OR phone ILIKE ?",
			searchTerm, searchTerm, searchTerm,
		)
	}

	// Conta o total de registros
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Aplica paginação e ordenação
	if filter != nil {
		if filter.OrderBy != "" {
			direction := "ASC"
			if filter.OrderDir != "" {
				direction = filter.OrderDir
			}
			query = query.Order(filter.OrderBy + " " + direction)
		}

		// Aplica paginação
		offset := (filter.Page - 1) * filter.PerPage
		query = query.Offset(offset).Limit(filter.PerPage)
	}

	// Executa a consulta
	if err := query.Find(&members).Error; err != nil {
		return nil, 0, err
	}

	return members, total, nil
}
