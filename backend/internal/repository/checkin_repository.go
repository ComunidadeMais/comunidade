package repository

import (
	"context"

	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/comunidade/backend/internal/domain"
)

type CheckInRepository interface {
	Create(ctx context.Context, checkIn *domain.CheckIn) error
	GetByEventID(ctx context.Context, eventID string) ([]domain.CheckIn, error)
	GetStats(ctx context.Context, eventID string) (*domain.CheckInStats, error)
}

type checkInRepository struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewCheckInRepository(db *gorm.DB, logger *zap.Logger) CheckInRepository {
	return &checkInRepository{
		db:     db,
		logger: logger,
	}
}

func (r *checkInRepository) Create(ctx context.Context, checkIn *domain.CheckIn) error {
	return r.db.WithContext(ctx).Create(checkIn).Error
}

func (r *checkInRepository) GetByEventID(ctx context.Context, eventID string) ([]domain.CheckIn, error) {
	var checkIns []domain.CheckIn
	err := r.db.WithContext(ctx).Where("event_id = ?", eventID).Find(&checkIns).Error
	return checkIns, err
}

func (r *checkInRepository) GetStats(ctx context.Context, eventID string) (*domain.CheckInStats, error) {
	var stats domain.CheckInStats

	// Total de check-ins
	if err := r.db.WithContext(ctx).Model(&domain.CheckIn{}).
		Where("event_id = ?", eventID).
		Count(&stats.TotalCheckIns).Error; err != nil {
		return nil, err
	}

	// Check-ins de membros
	if err := r.db.WithContext(ctx).Model(&domain.CheckIn{}).
		Where("event_id = ? AND is_visitor = ?", eventID, false).
		Count(&stats.MembersCheckIns).Error; err != nil {
		return nil, err
	}

	// Check-ins de visitantes
	if err := r.db.WithContext(ctx).Model(&domain.CheckIn{}).
		Where("event_id = ? AND is_visitor = ?", eventID, true).
		Count(&stats.VisitorsCheckIns).Error; err != nil {
		return nil, err
	}

	return &stats, nil
}
