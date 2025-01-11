package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/google/uuid"
)

type GroupUseCase interface {
	// Operações básicas
	Create(ctx context.Context, communityID string, group *domain.Group) error
	Update(ctx context.Context, communityID string, group *domain.Group) error
	Delete(ctx context.Context, communityID string, groupID string) error
	GetByID(ctx context.Context, communityID string, groupID string) (*domain.Group, error)
	List(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.Group, int64, error)

	// Operações de membros
	AddMember(ctx context.Context, communityID string, groupID string, memberID string) error
	RemoveMember(ctx context.Context, communityID string, groupID string, memberID string) error
	ListMembers(ctx context.Context, groupID string, filter *repository.Filter) ([]*domain.Member, error)

	// Operações de liderança
	SetLeader(ctx context.Context, communityID string, groupID string, leaderID string) error
	SetCoLeader(ctx context.Context, communityID string, groupID string, coLeaderID string) error
	RemoveLeader(ctx context.Context, communityID string, groupID string) error
	RemoveCoLeader(ctx context.Context, communityID string, groupID string) error

	// Operações de busca
	Search(ctx context.Context, communityID string, query string, filter *repository.Filter) ([]*domain.Group, error)
	FindByType(ctx context.Context, communityID string, groupType string, filter *repository.Filter) ([]*domain.Group, error)
	FindByCategory(ctx context.Context, communityID string, category string, filter *repository.Filter) ([]*domain.Group, error)
}

type groupUseCase struct {
	groupRepo repository.GroupRepository
}

func NewGroupUseCase(groupRepo repository.GroupRepository) GroupUseCase {
	return &groupUseCase{
		groupRepo: groupRepo,
	}
}

// Operações básicas
func (uc *groupUseCase) Create(ctx context.Context, communityID string, group *domain.Group) error {
	// Valida o nome do grupo
	isValid, err := uc.groupRepo.ValidateGroupName(ctx, communityID, group.Name)
	if err != nil {
		return err
	}
	if !isValid {
		return errors.New("group name already exists in this community")
	}

	// Gera um novo ID
	group.ID = uuid.New().String()
	group.CommunityID = communityID
	group.CreatedAt = time.Now()
	group.UpdatedAt = time.Now()

	// Cria o grupo
	return uc.groupRepo.Create(ctx, group)
}

func (uc *groupUseCase) Update(ctx context.Context, communityID string, group *domain.Group) error {
	// Verifica se o grupo existe e pertence à comunidade
	existingGroup, err := uc.groupRepo.FindByID(ctx, communityID, group.ID)
	if err != nil {
		return err
	}

	// Se o nome foi alterado, valida o novo nome
	if existingGroup.Name != group.Name {
		isValid, err := uc.groupRepo.ValidateGroupName(ctx, communityID, group.Name)
		if err != nil {
			return err
		}
		if !isValid {
			return errors.New("group name already exists in this community")
		}
	}

	// Atualiza os campos
	group.CommunityID = communityID
	group.UpdatedAt = time.Now()

	return uc.groupRepo.Update(ctx, group)
}

func (uc *groupUseCase) Delete(ctx context.Context, communityID string, groupID string) error {
	return uc.groupRepo.Delete(ctx, communityID, groupID)
}

func (uc *groupUseCase) GetByID(ctx context.Context, communityID string, groupID string) (*domain.Group, error) {
	return uc.groupRepo.FindByID(ctx, communityID, groupID)
}

func (uc *groupUseCase) List(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.Group, int64, error) {
	return uc.groupRepo.List(ctx, communityID, filter)
}

// Operações de membros
func (uc *groupUseCase) AddMember(ctx context.Context, communityID string, groupID string, memberID string) error {
	// Verifica se o membro atende aos requisitos do grupo
	isValid, err := uc.groupRepo.ValidateMembershipRequirements(ctx, groupID, memberID)
	if err != nil {
		return err
	}
	if !isValid {
		return errors.New("member does not meet group requirements")
	}

	// Adiciona o membro ao grupo
	if err := uc.groupRepo.AddMember(ctx, communityID, groupID, memberID); err != nil {
		return err
	}

	// Atualiza a contagem de membros
	return uc.groupRepo.UpdateMemberCount(ctx, groupID)
}

func (uc *groupUseCase) RemoveMember(ctx context.Context, communityID string, groupID string, memberID string) error {
	// Remove o membro do grupo
	if err := uc.groupRepo.RemoveMember(ctx, communityID, groupID, memberID); err != nil {
		return err
	}

	// Atualiza a contagem de membros
	return uc.groupRepo.UpdateMemberCount(ctx, groupID)
}

func (uc *groupUseCase) ListMembers(ctx context.Context, groupID string, filter *repository.Filter) ([]*domain.Member, error) {
	return uc.groupRepo.ListMembers(ctx, groupID, filter)
}

// Operações de liderança
func (uc *groupUseCase) SetLeader(ctx context.Context, communityID string, groupID string, leaderID string) error {
	// Verifica se o grupo existe e pertence à comunidade
	if _, err := uc.groupRepo.FindByID(ctx, communityID, groupID); err != nil {
		return err
	}

	// Verifica se o líder é membro do grupo
	isMember, err := uc.groupRepo.IsMember(ctx, groupID, leaderID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("leader must be a member of the group")
	}

	return uc.groupRepo.SetLeader(ctx, groupID, leaderID)
}

func (uc *groupUseCase) SetCoLeader(ctx context.Context, communityID string, groupID string, coLeaderID string) error {
	// Verifica se o grupo existe e pertence à comunidade
	if _, err := uc.groupRepo.FindByID(ctx, communityID, groupID); err != nil {
		return err
	}

	// Verifica se o co-líder é membro do grupo
	isMember, err := uc.groupRepo.IsMember(ctx, groupID, coLeaderID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("co-leader must be a member of the group")
	}

	return uc.groupRepo.SetCoLeader(ctx, groupID, coLeaderID)
}

func (uc *groupUseCase) RemoveLeader(ctx context.Context, communityID string, groupID string) error {
	// Verifica se o grupo existe e pertence à comunidade
	if _, err := uc.groupRepo.FindByID(ctx, communityID, groupID); err != nil {
		return err
	}

	return uc.groupRepo.RemoveLeader(ctx, groupID)
}

func (uc *groupUseCase) RemoveCoLeader(ctx context.Context, communityID string, groupID string) error {
	// Verifica se o grupo existe e pertence à comunidade
	if _, err := uc.groupRepo.FindByID(ctx, communityID, groupID); err != nil {
		return err
	}

	return uc.groupRepo.RemoveCoLeader(ctx, groupID)
}

// Operações de busca
func (uc *groupUseCase) Search(ctx context.Context, communityID string, query string, filter *repository.Filter) ([]*domain.Group, error) {
	// Aplica o filtro de comunidade
	filter.AddCondition("community_id = ?", communityID)
	return uc.groupRepo.Search(ctx, query, filter)
}

func (uc *groupUseCase) FindByType(ctx context.Context, communityID string, groupType string, filter *repository.Filter) ([]*domain.Group, error) {
	// Aplica o filtro de comunidade
	filter.AddCondition("community_id = ?", communityID)
	return uc.groupRepo.FindByType(ctx, groupType, filter)
}

func (uc *groupUseCase) FindByCategory(ctx context.Context, communityID string, category string, filter *repository.Filter) ([]*domain.Group, error) {
	// Aplica o filtro de comunidade
	filter.AddCondition("community_id = ?", communityID)
	return uc.groupRepo.FindByCategory(ctx, category, filter)
}
