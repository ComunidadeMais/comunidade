package repository

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ContributionRepository interface {
	Repository
	FindByBatch(ctx context.Context, batchID string) ([]*domain.Contribution, error)
	List(ctx context.Context, filter *Filter) ([]*domain.Contribution, int64, error)
	CreateBatch(ctx context.Context, batch *domain.ContributionBatch) error
	UpdateBatch(ctx context.Context, batch *domain.ContributionBatch) error
}

type contributionRepository struct {
	BaseRepository
}

func NewContributionRepository(db *gorm.DB, logger *zap.Logger) ContributionRepository {
	return &contributionRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *contributionRepository) FindByBatch(ctx context.Context, batchID string) ([]*domain.Contribution, error) {
	var contributions []*domain.Contribution
	if err := r.GetDB().WithContext(ctx).Where("batch_id = ?", batchID).Find(&contributions).Error; err != nil {
		return nil, err
	}
	return contributions, nil
}

func (r *contributionRepository) List(ctx context.Context, filter *Filter) ([]*domain.Contribution, int64, error) {
	var contributions []*domain.Contribution
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Contribution{})

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&contributions).Error; err != nil {
		return nil, 0, err
	}

	return contributions, total, nil
}

func (r *contributionRepository) CreateBatch(ctx context.Context, batch *domain.ContributionBatch) error {
	return r.GetDB().WithContext(ctx).Create(batch).Error
}

func (r *contributionRepository) UpdateBatch(ctx context.Context, batch *domain.ContributionBatch) error {
	return r.GetDB().WithContext(ctx).Save(batch).Error
}
