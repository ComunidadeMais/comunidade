package service

import (
	"context"
	"errors"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
)

var (
	ErrEventNotFound    = errors.New("evento não encontrado")
	ErrDuplicateCheckIn = errors.New("já existe um check-in para este email ou telefone neste evento")
)

type CheckInService interface {
	CreateCheckIn(ctx context.Context, request *domain.CheckInRequest) error
	GetEventCheckIns(ctx context.Context, eventID string) ([]domain.CheckIn, error)
	GetEventStats(ctx context.Context, eventID string) (*domain.CheckInStats, error)
}

type checkInService struct {
	checkInRepo repository.CheckInRepository
	memberRepo  repository.MemberRepository
	eventRepo   repository.EventRepository
}

func NewCheckInService(checkInRepo repository.CheckInRepository, memberRepo repository.MemberRepository, eventRepo repository.EventRepository) CheckInService {
	return &checkInService{
		checkInRepo: checkInRepo,
		memberRepo:  memberRepo,
		eventRepo:   eventRepo,
	}
}

func (s *checkInService) CreateCheckIn(ctx context.Context, request *domain.CheckInRequest) error {
	// Primeiro busca o evento para obter o communityID
	event, err := s.eventRepo.FindPublicByID(ctx, request.EventID)
	if err != nil {
		return err
	}
	if event == nil {
		return ErrEventNotFound
	}

	// Verifica se já existe check-in com o mesmo email ou telefone
	existingCheckIns, err := s.checkInRepo.GetByEventID(ctx, request.EventID)
	if err != nil {
		return err
	}

	for _, checkIn := range existingCheckIns {
		if (request.Email != "" && checkIn.Email == request.Email) ||
			(request.Phone != "" && checkIn.Phone == request.Phone) {
			return ErrDuplicateCheckIn
		}
	}

	checkIn := &domain.CheckIn{
		EventID:   request.EventID,
		MemberID:  request.MemberID,
		IsVisitor: request.IsVisitor,
		Name:      request.Name,
		Email:     request.Email,
		Phone:     request.Phone,
		City:      request.City,
		District:  request.District,
		Source:    request.Source,
		Consent:   request.Consent,
		CheckInAt: time.Now(),
	}

	if err := s.checkInRepo.Create(ctx, checkIn); err != nil {
		return err
	}

	// Se houver membros da família, criar check-in para cada um
	if len(request.FamilyIds) > 0 {
		for _, familyMemberID := range request.FamilyIds {
			// Busca os dados do membro da família usando o communityID do evento
			familyMember, err := s.memberRepo.FindByID(ctx, event.CommunityID, familyMemberID)
			if err != nil {
				return err
			}
			if familyMember == nil {
				continue // Pula se o membro não for encontrado
			}

			// Verifica se já existe check-in para o membro da família
			for _, checkIn := range existingCheckIns {
				if (familyMember.Email != "" && checkIn.Email == familyMember.Email) ||
					(familyMember.Phone != "" && checkIn.Phone == familyMember.Phone) {
					continue // Pula se já existe check-in para este membro da família
				}
			}

			familyCheckIn := &domain.CheckIn{
				EventID:   request.EventID,
				MemberID:  &familyMemberID,
				IsVisitor: false,
				Name:      familyMember.Name,
				Email:     familyMember.Email,
				Phone:     familyMember.Phone,
				City:      familyMember.City,
				CheckInAt: time.Now(),
				Consent:   true, // Assumindo que o consentimento do responsável vale para a família
			}
			if err := s.checkInRepo.Create(ctx, familyCheckIn); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *checkInService) GetEventCheckIns(ctx context.Context, eventID string) ([]domain.CheckIn, error) {
	return s.checkInRepo.GetByEventID(ctx, eventID)
}

func (s *checkInService) GetEventStats(ctx context.Context, eventID string) (*domain.CheckInStats, error) {
	return s.checkInRepo.GetStats(ctx, eventID)
}
