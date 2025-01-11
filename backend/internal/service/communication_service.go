package service

import (
	"context"
	"errors"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CommunicationService interface {
	CreateCommunication(ctx context.Context, communityID string, communication *domain.Communication) error
	GetCommunication(ctx context.Context, communityID, communicationID string) (*domain.Communication, error)
	ListCommunications(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.Communication, int64, error)
	UpdateCommunication(ctx context.Context, communityID, communicationID string, communication *domain.Communication) error
	DeleteCommunication(ctx context.Context, communityID, communicationID string) error
	SendCommunication(ctx context.Context, communityID, communicationID string) error

	CreateTemplate(ctx context.Context, communityID string, template *domain.CommunicationTemplate) error
	GetTemplate(ctx context.Context, communityID, templateID string) (*domain.CommunicationTemplate, error)
	ListTemplates(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.CommunicationTemplate, int64, error)
	UpdateTemplate(ctx context.Context, communityID, templateID string, template *domain.CommunicationTemplate) error
	DeleteTemplate(ctx context.Context, communityID, templateID string) error

	GetCommunicationSettings(ctx context.Context, communityID string) (*domain.CommunicationSettings, error)
	UpdateCommunicationSettings(ctx context.Context, communityID string, settings *domain.CommunicationSettings) error
}

type communicationService struct {
	repos  *repository.Repositories
	logger *zap.Logger
}

func NewCommunicationService(repos *repository.Repositories, logger *zap.Logger) CommunicationService {
	return &communicationService{
		repos:  repos,
		logger: logger,
	}
}

func (s *communicationService) CreateCommunication(ctx context.Context, communityID string, communication *domain.Communication) error {
	communication.ID = uuid.New().String()
	communication.CommunityID = communityID
	communication.Status = domain.CommunicationStatusPending
	communication.CreatedAt = time.Now()
	communication.UpdatedAt = time.Now()

	return s.repos.Communication.Create(ctx, communication)
}

func (s *communicationService) GetCommunication(ctx context.Context, communityID, communicationID string) (*domain.Communication, error) {
	communication, err := s.repos.Communication.FindByID(ctx, communityID, communicationID)
	if err != nil {
		return nil, err
	}
	if communication == nil {
		return nil, errors.New("communication not found")
	}
	return communication, nil
}

func (s *communicationService) ListCommunications(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.Communication, int64, error) {
	return s.repos.Communication.List(ctx, communityID, filter)
}

func (s *communicationService) UpdateCommunication(ctx context.Context, communityID, communicationID string, communication *domain.Communication) error {
	existing, err := s.GetCommunication(ctx, communityID, communicationID)
	if err != nil {
		return err
	}

	communication.ID = existing.ID
	communication.CommunityID = communityID
	communication.CreatedAt = existing.CreatedAt
	communication.UpdatedAt = time.Now()

	return s.repos.Communication.Update(ctx, communication)
}

func (s *communicationService) DeleteCommunication(ctx context.Context, communityID, communicationID string) error {
	_, err := s.GetCommunication(ctx, communityID, communicationID)
	if err != nil {
		return err
	}

	return s.repos.Communication.Delete(ctx, communityID, communicationID)
}

func (s *communicationService) SendCommunication(ctx context.Context, communityID, communicationID string) error {
	communication, err := s.GetCommunication(ctx, communityID, communicationID)
	if err != nil {
		return err
	}

	if communication.Status != domain.CommunicationStatusPending {
		return errors.New("communication already sent")
	}

	// Buscar destinatários com base no tipo
	var recipients []*domain.CommunicationRecipient

	switch communication.RecipientType {
	case domain.RecipientTypeMember:
		member, err := s.repos.Member.FindByID(ctx, communityID, communication.RecipientID)
		if err != nil {
			return err
		}
		if member == nil {
			return errors.New("member not found")
		}
		recipients = append(recipients, &domain.CommunicationRecipient{
			ID:              uuid.New().String(),
			CommunicationID: communication.ID,
			RecipientType:   domain.RecipientTypeMember,
			RecipientID:     member.ID,
			Email:           &member.Email,
			Status:          domain.CommunicationStatusPending,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		})

	case domain.RecipientTypeGroup:
		members, err := s.repos.Group.ListMembers(ctx, communityID, &repository.Filter{})
		if err != nil {
			return err
		}
		for _, member := range members {
			recipients = append(recipients, &domain.CommunicationRecipient{
				ID:              uuid.New().String(),
				CommunicationID: communication.ID,
				RecipientType:   domain.RecipientTypeGroup,
				RecipientID:     member.ID,
				Email:           &member.Email,
				Status:          domain.CommunicationStatusPending,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			})
		}

	case domain.RecipientTypeFamily:
		family, err := s.repos.Family.FindByID(ctx, communityID, communication.RecipientID)
		if err != nil {
			return err
		}
		if family == nil {
			return errors.New("family not found")
		}
		recipients = append(recipients, &domain.CommunicationRecipient{
			ID:              uuid.New().String(),
			CommunicationID: communication.ID,
			RecipientType:   domain.RecipientTypeFamily,
			RecipientID:     family.ID,
			Status:          domain.CommunicationStatusPending,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		})
	}

	// Criar destinatários
	for _, recipient := range recipients {
		err = s.repos.Communication.CreateRecipient(ctx, recipient)
		if err != nil {
			return err
		}
	}

	// Atualizar status da comunicação
	communication.Status = domain.CommunicationStatusSent
	communication.UpdatedAt = time.Now()
	return s.repos.Communication.Update(ctx, communication)
}

func (s *communicationService) CreateTemplate(ctx context.Context, communityID string, template *domain.CommunicationTemplate) error {
	template.ID = uuid.New().String()
	template.CommunityID = communityID
	template.CreatedAt = time.Now()
	template.UpdatedAt = time.Now()

	return s.repos.Communication.CreateTemplate(ctx, template)
}

func (s *communicationService) GetTemplate(ctx context.Context, communityID, templateID string) (*domain.CommunicationTemplate, error) {
	template, err := s.repos.Communication.FindTemplateByID(ctx, communityID, templateID)
	if err != nil {
		return nil, err
	}
	if template == nil {
		return nil, errors.New("template not found")
	}
	return template, nil
}

func (s *communicationService) ListTemplates(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.CommunicationTemplate, int64, error) {
	return s.repos.Communication.ListTemplates(ctx, communityID, filter)
}

func (s *communicationService) UpdateTemplate(ctx context.Context, communityID, templateID string, template *domain.CommunicationTemplate) error {
	existing, err := s.GetTemplate(ctx, communityID, templateID)
	if err != nil {
		return err
	}

	template.ID = existing.ID
	template.CommunityID = communityID
	template.CreatedAt = existing.CreatedAt
	template.UpdatedAt = time.Now()

	return s.repos.Communication.UpdateTemplate(ctx, template)
}

func (s *communicationService) DeleteTemplate(ctx context.Context, communityID, templateID string) error {
	_, err := s.GetTemplate(ctx, communityID, templateID)
	if err != nil {
		return err
	}

	return s.repos.Communication.DeleteTemplate(ctx, communityID, templateID)
}

func (s *communicationService) GetCommunicationSettings(ctx context.Context, communityID string) (*domain.CommunicationSettings, error) {
	settings, err := s.repos.Communication.GetSettings(ctx, communityID)
	if err != nil {
		return nil, err
	}
	if settings == nil {
		return nil, errors.New("settings not found")
	}
	return settings, nil
}

func (s *communicationService) UpdateCommunicationSettings(ctx context.Context, communityID string, settings *domain.CommunicationSettings) error {
	existing, err := s.repos.Communication.GetSettings(ctx, communityID)
	if err != nil {
		return err
	}

	settings.CommunityID = communityID

	if existing == nil {
		return s.repos.Communication.CreateSettings(ctx, settings)
	}

	return s.repos.Communication.UpdateSettings(ctx, settings)
}
