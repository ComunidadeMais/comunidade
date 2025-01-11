package repository

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CommunityRepository interface {
	Repository
	Create(ctx context.Context, community *domain.Community) error
	Update(ctx context.Context, community *domain.Community) error
	Delete(ctx context.Context, id string) error
	FindByID(ctx context.Context, id string) (*domain.Community, error)
	FindBySlug(ctx context.Context, slug string) (*domain.Community, error)
	List(ctx context.Context, filter *Filter) ([]*domain.Community, int64, error)
}

type communityRepository struct {
	BaseRepository
}

func NewCommunityRepository(db *gorm.DB, logger *zap.Logger) CommunityRepository {
	return &communityRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *communityRepository) Create(ctx context.Context, community *domain.Community) error {
	return r.GetDB().WithContext(ctx).Create(community).Error
}

func (r *communityRepository) Update(ctx context.Context, community *domain.Community) error {
	return r.GetDB().WithContext(ctx).Save(community).Error
}

func (r *communityRepository) Delete(ctx context.Context, id string) error {
	return r.GetDB().WithContext(ctx).Delete(&domain.Community{}, "id = ?", id).Error
}

func (r *communityRepository) FindByID(ctx context.Context, id string) (*domain.Community, error) {
	var community domain.Community
	if err := r.GetDB().WithContext(ctx).First(&community, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &community, nil
}

func (r *communityRepository) FindBySlug(ctx context.Context, slug string) (*domain.Community, error) {
	var community domain.Community
	if err := r.GetDB().WithContext(ctx).First(&community, "slug = ?", slug).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &community, nil
}

func (r *communityRepository) List(ctx context.Context, filter *Filter) ([]*domain.Community, int64, error) {
	var communities []*domain.Community
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Community{})

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&communities).Error; err != nil {
		return nil, 0, err
	}

	return communities, total, nil
}
