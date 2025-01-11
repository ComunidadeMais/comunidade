package repository

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type EventRepository interface {
	Repository
	Create(ctx context.Context, event *domain.Event) error
	Update(ctx context.Context, event *domain.Event) error
	Delete(ctx context.Context, communityID, eventID string) error
	FindByID(ctx context.Context, communityID, eventID string) (*domain.Event, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Event, int64, error)
	RegisterAttendance(ctx context.Context, attendance *domain.Attendance) error
	UpdateAttendance(ctx context.Context, attendance *domain.Attendance) error
}

type eventRepository struct {
	BaseRepository
}

func NewEventRepository(db *gorm.DB, logger *zap.Logger) EventRepository {
	return &eventRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *eventRepository) Create(ctx context.Context, event *domain.Event) error {
	return r.GetDB().WithContext(ctx).Create(event).Error
}

func (r *eventRepository) Update(ctx context.Context, event *domain.Event) error {
	return r.GetDB().WithContext(ctx).Save(event).Error
}

func (r *eventRepository) Delete(ctx context.Context, communityID, eventID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, eventID).
		Delete(&domain.Event{}).Error
}

func (r *eventRepository) FindByID(ctx context.Context, communityID, eventID string) (*domain.Event, error) {
	var event domain.Event
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, eventID).
		First(&event).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &event, nil
}

func (r *eventRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Event, int64, error) {
	var events []*domain.Event
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Event{}).
		Where("community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&events).Error; err != nil {
		return nil, 0, err
	}

	return events, total, nil
}

func (r *eventRepository) RegisterAttendance(ctx context.Context, attendance *domain.Attendance) error {
	return r.GetDB().WithContext(ctx).Create(attendance).Error
}

func (r *eventRepository) UpdateAttendance(ctx context.Context, attendance *domain.Attendance) error {
	return r.GetDB().WithContext(ctx).
		Where("event_id = ? AND member_id = ?", attendance.EventID, attendance.MemberID).
		Updates(attendance).Error
}
