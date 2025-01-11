package repository

import (
	"context"
	"errors"

	"github.com/comunidade/backend/internal/domain"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CommunicationRepository interface {
	Repository
	Create(ctx context.Context, communication *domain.Communication) error
	Update(ctx context.Context, communication *domain.Communication) error
	Delete(ctx context.Context, communityID, communicationID string) error
	FindByID(ctx context.Context, communityID, communicationID string) (*domain.Communication, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Communication, int64, error)

	CreateRecipient(ctx context.Context, recipient *domain.CommunicationRecipient) error
	UpdateRecipient(ctx context.Context, recipient *domain.CommunicationRecipient) error
	ListRecipients(ctx context.Context, communicationID string) ([]*domain.CommunicationRecipient, error)

	CreateTemplate(ctx context.Context, template *domain.CommunicationTemplate) error
	UpdateTemplate(ctx context.Context, template *domain.CommunicationTemplate) error
	DeleteTemplate(ctx context.Context, communityID, templateID string) error
	FindTemplateByID(ctx context.Context, communityID, templateID string) (*domain.CommunicationTemplate, error)
	ListTemplates(ctx context.Context, communityID string, filter *Filter) ([]*domain.CommunicationTemplate, int64, error)

	GetSettings(ctx context.Context, communityID string) (*domain.CommunicationSettings, error)
	UpdateSettings(ctx context.Context, settings *domain.CommunicationSettings) error
	CreateSettings(ctx context.Context, settings *domain.CommunicationSettings) error
}

type communicationRepository struct {
	BaseRepository
}

func NewCommunicationRepository(db *gorm.DB, logger *zap.Logger) CommunicationRepository {
	return &communicationRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *communicationRepository) Create(ctx context.Context, communication *domain.Communication) error {
	return r.GetDB().WithContext(ctx).Create(communication).Error
}

func (r *communicationRepository) Update(ctx context.Context, communication *domain.Communication) error {
	return r.GetDB().WithContext(ctx).Save(communication).Error
}

func (r *communicationRepository) Delete(ctx context.Context, communityID, communicationID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, communicationID).
		Delete(&domain.Communication{}).Error
}

func (r *communicationRepository) FindByID(ctx context.Context, communityID, communicationID string) (*domain.Communication, error) {
	var communication domain.Communication
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, communicationID).
		First(&communication).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &communication, nil
}

func (r *communicationRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Communication, int64, error) {
	var communications []*domain.Communication
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Communication{}).
		Where("community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&communications).Error; err != nil {
		return nil, 0, err
	}

	return communications, total, nil
}

func (r *communicationRepository) CreateRecipient(ctx context.Context, recipient *domain.CommunicationRecipient) error {
	return r.GetDB().WithContext(ctx).Create(recipient).Error
}

func (r *communicationRepository) UpdateRecipient(ctx context.Context, recipient *domain.CommunicationRecipient) error {
	return r.GetDB().WithContext(ctx).Save(recipient).Error
}

func (r *communicationRepository) ListRecipients(ctx context.Context, communicationID string) ([]*domain.CommunicationRecipient, error) {
	var recipients []*domain.CommunicationRecipient
	if err := r.GetDB().WithContext(ctx).
		Where("communication_id = ?", communicationID).
		Find(&recipients).Error; err != nil {
		return nil, err
	}
	return recipients, nil
}

func (r *communicationRepository) CreateTemplate(ctx context.Context, template *domain.CommunicationTemplate) error {
	return r.GetDB().WithContext(ctx).Create(template).Error
}

func (r *communicationRepository) UpdateTemplate(ctx context.Context, template *domain.CommunicationTemplate) error {
	return r.GetDB().WithContext(ctx).Save(template).Error
}

func (r *communicationRepository) DeleteTemplate(ctx context.Context, communityID, templateID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, templateID).
		Delete(&domain.CommunicationTemplate{}).Error
}

func (r *communicationRepository) FindTemplateByID(ctx context.Context, communityID, templateID string) (*domain.CommunicationTemplate, error) {
	var template domain.CommunicationTemplate
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, templateID).
		First(&template).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &template, nil
}

func (r *communicationRepository) ListTemplates(ctx context.Context, communityID string, filter *Filter) ([]*domain.CommunicationTemplate, int64, error) {
	var templates []*domain.CommunicationTemplate
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.CommunicationTemplate{}).
		Where("community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&templates).Error; err != nil {
		return nil, 0, err
	}

	return templates, total, nil
}

func (r *communicationRepository) GetSettings(ctx context.Context, communityID string) (*domain.CommunicationSettings, error) {
	var settings domain.CommunicationSettings
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ?", communityID).
		First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &settings, nil
}

func (r *communicationRepository) CreateSettings(ctx context.Context, settings *domain.CommunicationSettings) error {
	if settings.ID == "" {
		settings.ID = uuid.New().String()
	}
	return r.GetDB().WithContext(ctx).Create(settings).Error
}

func (r *communicationRepository) UpdateSettings(ctx context.Context, settings *domain.CommunicationSettings) error {
	var existing domain.CommunicationSettings
	err := r.GetDB().WithContext(ctx).
		Where("community_id = ?", settings.CommunityID).
		First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		return errors.New("settings not found")
	} else if err != nil {
		return err
	}

	settings.ID = existing.ID
	settings.CreatedAt = existing.CreatedAt
	return r.GetDB().WithContext(ctx).Model(&domain.CommunicationSettings{}).
		Where("id = ?", existing.ID).
		Updates(settings).Error
}
