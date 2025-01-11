package repository

import (
	"context"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type GroupRepository interface {
	// Operações básicas
	Create(ctx context.Context, group *domain.Group) error
	Update(ctx context.Context, group *domain.Group) error
	Delete(ctx context.Context, communityID string, groupID string) error
	FindByID(ctx context.Context, communityID string, groupID string) (*domain.Group, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Group, int64, error)
	GetDB() *gorm.DB

	// Operações específicas
	FindByCommunity(ctx context.Context, communityID string, filter *Filter) ([]*domain.Group, error)
	FindByLeader(ctx context.Context, leaderID string, filter *Filter) ([]*domain.Group, error)
	FindByMember(ctx context.Context, memberID string, filter *Filter) ([]*domain.Group, error)
	FindByType(ctx context.Context, groupType string, filter *Filter) ([]*domain.Group, error)
	FindByCategory(ctx context.Context, category string, filter *Filter) ([]*domain.Group, error)
	FindActive(ctx context.Context, filter *Filter) ([]*domain.Group, error)
	FindPublic(ctx context.Context, filter *Filter) ([]*domain.Group, error)

	// Operações de membros
	AddMember(ctx context.Context, communityID string, groupID string, memberID string) error
	RemoveMember(ctx context.Context, communityID string, groupID string, memberID string) error
	ListMembers(ctx context.Context, groupID string, filter *Filter) ([]*domain.Member, error)
	IsMember(ctx context.Context, groupID string, memberID string) (bool, error)

	// Operações de liderança
	SetLeader(ctx context.Context, groupID string, leaderID string) error
	SetCoLeader(ctx context.Context, groupID string, coLeaderID string) error
	RemoveLeader(ctx context.Context, groupID string) error
	RemoveCoLeader(ctx context.Context, groupID string) error

	// Operações de estatísticas
	UpdateMemberCount(ctx context.Context, groupID string) error
	UpdateAttendanceStats(ctx context.Context, groupID string) error
	IncrementMeetingCount(ctx context.Context, groupID string) error

	// Operações de busca avançada
	Search(ctx context.Context, query string, filter *Filter) ([]*domain.Group, error)
	FindByTags(ctx context.Context, tags []string, filter *Filter) ([]*domain.Group, error)
	FindByAgeRange(ctx context.Context, minAge int, maxAge int, filter *Filter) ([]*domain.Group, error)
	FindByGender(ctx context.Context, gender string, filter *Filter) ([]*domain.Group, error)
	FindByMeetingDay(ctx context.Context, day string, filter *Filter) ([]*domain.Group, error)
	FindByLocation(ctx context.Context, location string, filter *Filter) ([]*domain.Group, error)

	// Operações de validação
	ValidateGroupName(ctx context.Context, communityID string, name string) (bool, error)
	ValidateMembershipRequirements(ctx context.Context, groupID string, memberID string) (bool, error)

	// Operações de contagem
	CountMembers(ctx context.Context, groupID string) (int, error)
	CountGroups(ctx context.Context, filter *Filter) (int, error)
	CountGroupsByType(ctx context.Context, groupType string) (int, error)
	CountGroupsByCategory(ctx context.Context, category string) (int, error)
}

type groupRepository struct {
	BaseRepository
}

// CountGroups implements GroupRepository.
func (r *groupRepository) CountGroups(ctx context.Context, filter *Filter) (int, error) {
	panic("unimplemented")
}

// CountGroupsByCategory implements GroupRepository.
func (r *groupRepository) CountGroupsByCategory(ctx context.Context, category string) (int, error) {
	panic("unimplemented")
}

// CountGroupsByType implements GroupRepository.
func (r *groupRepository) CountGroupsByType(ctx context.Context, groupType string) (int, error) {
	panic("unimplemented")
}

// CountMembers implements GroupRepository.
func (r *groupRepository) CountMembers(ctx context.Context, groupID string) (int, error) {
	panic("unimplemented")
}

// FindActive implements GroupRepository.
func (r *groupRepository) FindActive(ctx context.Context, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByAgeRange implements GroupRepository.
func (r *groupRepository) FindByAgeRange(ctx context.Context, minAge int, maxAge int, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByCategory implements GroupRepository.
func (r *groupRepository) FindByCategory(ctx context.Context, category string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByCommunity implements GroupRepository.
func (r *groupRepository) FindByCommunity(ctx context.Context, communityID string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByGender implements GroupRepository.
func (r *groupRepository) FindByGender(ctx context.Context, gender string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByLeader implements GroupRepository.
func (r *groupRepository) FindByLeader(ctx context.Context, leaderID string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByLocation implements GroupRepository.
func (r *groupRepository) FindByLocation(ctx context.Context, location string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByMeetingDay implements GroupRepository.
func (r *groupRepository) FindByMeetingDay(ctx context.Context, day string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByMember implements GroupRepository.
func (r *groupRepository) FindByMember(ctx context.Context, memberID string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByTags implements GroupRepository.
func (r *groupRepository) FindByTags(ctx context.Context, tags []string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindByType implements GroupRepository.
func (r *groupRepository) FindByType(ctx context.Context, groupType string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// FindPublic implements GroupRepository.
func (r *groupRepository) FindPublic(ctx context.Context, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// GetDB implements GroupRepository.
func (r *groupRepository) GetDB() *gorm.DB {
	return r.BaseRepository.GetDB()
}

// IncrementMeetingCount implements GroupRepository.
func (r *groupRepository) IncrementMeetingCount(ctx context.Context, groupID string) error {
	panic("unimplemented")
}

// IsMember implements GroupRepository.
func (r *groupRepository) IsMember(ctx context.Context, groupID string, memberID string) (bool, error) {
	panic("unimplemented")
}

// ListMembers implements GroupRepository.
func (r *groupRepository) ListMembers(ctx context.Context, groupID string, filter *Filter) ([]*domain.Member, error) {
	var members []*domain.Member

	query := r.GetDB().WithContext(ctx).
		Table("members").
		Joins("INNER JOIN group_members ON group_members.member_id = members.id").
		Where("group_members.group_id = ?", groupID)

	// Aplicar filtros se existirem
	if filter != nil {
		if filter.Search != "" {
			query = query.Where("members.name ILIKE ? OR members.email ILIKE ?",
				"%"+filter.Search+"%", "%"+filter.Search+"%")
		}
		if len(filter.conditions) > 0 {
			for _, condition := range filter.conditions {
				query = query.Where(condition.query, condition.args...)
			}
		}
		if filter.OrderBy != "" {
			direction := "ASC"
			if filter.OrderDir != "" {
				direction = filter.OrderDir
			}
			query = query.Order(filter.OrderBy + " " + direction)
		}
		if filter.Page > 0 {
			offset := (filter.Page - 1) * filter.PerPage
			query = query.Offset(offset).Limit(filter.PerPage)
		}
	}

	if err := query.Find(&members).Error; err != nil {
		return nil, err
	}

	return members, nil
}

// RemoveCoLeader implements GroupRepository.
func (r *groupRepository) RemoveCoLeader(ctx context.Context, groupID string) error {
	panic("unimplemented")
}

// RemoveLeader implements GroupRepository.
func (r *groupRepository) RemoveLeader(ctx context.Context, groupID string) error {
	panic("unimplemented")
}

// Search implements GroupRepository.
func (r *groupRepository) Search(ctx context.Context, query string, filter *Filter) ([]*domain.Group, error) {
	panic("unimplemented")
}

// SetCoLeader implements GroupRepository.
func (r *groupRepository) SetCoLeader(ctx context.Context, groupID string, coLeaderID string) error {
	panic("unimplemented")
}

// SetLeader implements GroupRepository.
func (r *groupRepository) SetLeader(ctx context.Context, groupID string, leaderID string) error {
	panic("unimplemented")
}

// UpdateAttendanceStats implements GroupRepository.
func (r *groupRepository) UpdateAttendanceStats(ctx context.Context, groupID string) error {
	panic("unimplemented")
}

// ValidateGroupName implements GroupRepository.
func (r *groupRepository) ValidateGroupName(ctx context.Context, communityID string, name string) (bool, error) {
	panic("unimplemented")
}

// ValidateMembershipRequirements implements GroupRepository.
func (r *groupRepository) ValidateMembershipRequirements(ctx context.Context, groupID string, memberID string) (bool, error) {
	panic("unimplemented")
}

func NewGroupRepository(db *gorm.DB, logger *zap.Logger) GroupRepository {
	return &groupRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *groupRepository) Create(ctx context.Context, group *domain.Group) error {
	// Tratar campos UUID vazios
	if group.LeaderID != nil && *group.LeaderID == "" {
		group.LeaderID = nil
	}
	if group.CoLeaderID != nil && *group.CoLeaderID == "" {
		group.CoLeaderID = nil
	}
	if group.StartDate.IsZero() {
		group.StartDate = time.Now()
	}

	return r.GetDB().WithContext(ctx).Create(group).Error
}

func (r *groupRepository) Update(ctx context.Context, group *domain.Group) error {
	err := r.GetDB().WithContext(ctx).Save(group).Error
	if err != nil {
		return err
	}
	return r.UpdateMemberCount(ctx, group.ID)
}

func (r *groupRepository) Delete(ctx context.Context, communityID, groupID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, groupID).
		Delete(&domain.Group{}).Error
}

func (r *groupRepository) FindByID(ctx context.Context, communityID, groupID string) (*domain.Group, error) {
	var group domain.Group
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, groupID).
		First(&group).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &group, nil
}

func (r *groupRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Group, int64, error) {
	var groups []*domain.Group
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("community_id = ?", communityID)

	// Aplicar filtros se existirem
	if filter != nil {
		if filter.Search != "" {
			query = query.Where("name ILIKE ? OR description ILIKE ?",
				"%"+filter.Search+"%", "%"+filter.Search+"%")
		}
		if len(filter.conditions) > 0 {
			for _, condition := range filter.conditions {
				query = query.Where(condition.query, condition.args...)
			}
		}
		if filter.OrderBy != "" {
			direction := "ASC"
			if filter.OrderDir != "" {
				direction = filter.OrderDir
			}
			query = query.Order(filter.OrderBy + " " + direction)
		}
	}

	// Contar total de registros
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Aplicar paginação
	if filter != nil && filter.Page > 0 {
		offset := (filter.Page - 1) * filter.PerPage
		query = query.Offset(offset).Limit(filter.PerPage)
	}

	// Executar consulta
	if err := query.Find(&groups).Error; err != nil {
		return nil, 0, err
	}

	return groups, total, nil
}

func (r *groupRepository) AddMember(ctx context.Context, communityID, groupID, memberID string) error {
	return r.GetDB().WithContext(ctx).Exec(
		"INSERT INTO group_members (group_id, member_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
		groupID, memberID,
	).Error
}

func (r *groupRepository) RemoveMember(ctx context.Context, communityID, groupID, memberID string) error {
	return r.GetDB().WithContext(ctx).Exec(
		"DELETE FROM group_members WHERE group_id = ? AND member_id = ?",
		groupID, memberID,
	).Error
}

func (r *groupRepository) UpdateMemberCount(ctx context.Context, groupID string) error {
	return r.GetDB().WithContext(ctx).Exec(`
		UPDATE groups 
		SET member_count = (
			SELECT COUNT(*) 
			FROM group_members 
			WHERE group_id = ?
		)
		WHERE id = ?
	`, groupID, groupID).Error
}
