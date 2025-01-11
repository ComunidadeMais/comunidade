package postgres

import (
	"context"
	"errors"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type groupRepository struct {
	repository.BaseRepository
}

func NewGroupRepository(db *gorm.DB, logger *zap.Logger) repository.GroupRepository {
	return &groupRepository{
		BaseRepository: repository.NewBaseRepository(db, logger),
	}
}

// Operações básicas
func (r *groupRepository) Create(ctx context.Context, group *domain.Group) error {
	return r.GetDB().WithContext(ctx).Create(group).Error
}

func (r *groupRepository) Update(ctx context.Context, group *domain.Group) error {
	return r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("id = ?", group.ID).
		Updates(map[string]interface{}{
			"name":                   group.Name,
			"description":            group.Description,
			"type":                   group.Type,
			"category":               group.Category,
			"status":                 group.Status,
			"visibility":             group.Visibility,
			"leader_id":              group.LeaderID,
			"co_leader_id":           group.CoLeaderID,
			"location":               group.Location,
			"meeting_day":            group.MeetingDay,
			"meeting_time":           group.MeetingTime,
			"frequency":              group.Frequency,
			"max_members":            group.MaxMembers,
			"min_age":                group.MinAge,
			"max_age":                group.MaxAge,
			"gender":                 group.Gender,
			"tags":                   group.Tags,
			"start_date":             group.StartDate,
			"end_date":               group.EndDate,
			"allow_guests":           group.AllowGuests,
			"require_approval":       group.RequireApproval,
			"track_attendance":       group.TrackAttendance,
			"allow_self_join":        group.AllowSelfJoin,
			"notify_on_join_request": group.NotifyOnJoinRequest,
			"notify_on_new_member":   group.NotifyOnNewMember,
			"member_count":           group.MemberCount,
			"attendance_count":       group.AttendanceCount,
			"average_attendance":     group.AverageAttendance,
			"meeting_count":          group.MeetingCount,
			"updated_at":             group.UpdatedAt,
		}).Error
}

func (r *groupRepository) Delete(ctx context.Context, communityID string, groupID string) error {
	result := r.GetDB().WithContext(ctx).Delete(&domain.Group{}, "id = ? AND community_id = ?", groupID, communityID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return repository.ErrNotFound
	}
	return nil
}

func (r *groupRepository) FindByID(ctx context.Context, communityID string, groupID string) (*domain.Group, error) {
	var group domain.Group
	err := r.GetDB().WithContext(ctx).First(&group, "id = ? AND community_id = ?", groupID, communityID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, repository.ErrNotFound
		}
		return nil, err
	}
	return &group, nil
}

func (r *groupRepository) List(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.Group, int64, error) {
	var groups []*domain.Group
	var total int64

	// Primeiro conta o total de registros
	query := r.GetDB().WithContext(ctx).Model(&domain.Group{}).Where("community_id = ?", communityID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Depois busca os registros com paginação
	query = r.GetDB().WithContext(ctx).Where("community_id = ?", communityID)
	query = repository.ApplyFilter(query, filter)
	if err := query.Find(&groups).Error; err != nil {
		return nil, 0, err
	}

	return groups, total, nil
}

// Operações específicas
func (r *groupRepository) FindByCommunity(ctx context.Context, communityID string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("community_id = ?", communityID)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByLeader(ctx context.Context, leaderID string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("leader_id = ?", leaderID)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByMember(ctx context.Context, memberID string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).
		Joins("JOIN group_members ON groups.id = group_members.group_id").
		Where("group_members.member_id = ?", memberID)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByType(ctx context.Context, groupType string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("type = ?", groupType)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByCategory(ctx context.Context, category string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("category = ?", category)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindActive(ctx context.Context, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("status = ?", "active")
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindPublic(ctx context.Context, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("visibility = ?", "public")
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

// Operações de membros
func (r *groupRepository) AddMember(ctx context.Context, communityID string, groupID string, memberID string) error {
	// Primeiro verifica se o grupo pertence à comunidade
	var group domain.Group
	if err := r.GetDB().WithContext(ctx).First(&group, "id = ? AND community_id = ?", groupID, communityID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return repository.ErrNotFound
		}
		return err
	}

	// Depois verifica se o membro pertence à comunidade
	var member domain.Member
	if err := r.GetDB().WithContext(ctx).First(&member, "id = ? AND community_id = ?", memberID, communityID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return repository.ErrNotFound
		}
		return err
	}

	// Se ambos existem e pertencem à mesma comunidade, adiciona o membro ao grupo
	return r.GetDB().WithContext(ctx).Exec(
		"INSERT INTO group_members (group_id, member_id) VALUES (?, ?)",
		groupID, memberID,
	).Error
}

func (r *groupRepository) RemoveMember(ctx context.Context, communityID string, groupID string, memberID string) error {
	// Primeiro verifica se o grupo pertence à comunidade
	var group domain.Group
	if err := r.GetDB().WithContext(ctx).First(&group, "id = ? AND community_id = ?", groupID, communityID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return repository.ErrNotFound
		}
		return err
	}

	// Depois verifica se o membro pertence à comunidade
	var member domain.Member
	if err := r.GetDB().WithContext(ctx).First(&member, "id = ? AND community_id = ?", memberID, communityID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return repository.ErrNotFound
		}
		return err
	}

	// Se ambos existem e pertencem à mesma comunidade, remove o membro do grupo
	result := r.GetDB().WithContext(ctx).Exec(
		"DELETE FROM group_members WHERE group_id = ? AND member_id = ?",
		groupID, memberID,
	)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return repository.ErrNotFound
	}
	return nil
}

func (r *groupRepository) ListMembers(ctx context.Context, groupID string, filter *repository.Filter) ([]*domain.Member, error) {
	var members []*domain.Member
	query := r.GetDB().WithContext(ctx).
		Joins("JOIN group_members ON members.id = group_members.member_id").
		Where("group_members.group_id = ?", groupID)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&members).Error
	return members, err
}

func (r *groupRepository) IsMember(ctx context.Context, groupID string, memberID string) (bool, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Joins("JOIN group_members ON groups.id = group_members.group_id").
		Where("groups.id = ? AND group_members.member_id = ?", groupID, memberID).
		Count(&count).Error
	return count > 0, err
}

// Operações de liderança
func (r *groupRepository) SetLeader(ctx context.Context, groupID string, leaderID string) error {
	return r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("id = ?", groupID).
		Update("leader_id", leaderID).Error
}

func (r *groupRepository) SetCoLeader(ctx context.Context, groupID string, coLeaderID string) error {
	return r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("id = ?", groupID).
		Update("co_leader_id", coLeaderID).Error
}

func (r *groupRepository) RemoveLeader(ctx context.Context, groupID string) error {
	return r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("id = ?", groupID).
		Update("leader_id", nil).Error
}

func (r *groupRepository) RemoveCoLeader(ctx context.Context, groupID string) error {
	return r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("id = ?", groupID).
		Update("co_leader_id", nil).Error
}

// Operações de estatísticas
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

func (r *groupRepository) UpdateAttendanceStats(ctx context.Context, groupID string) error {
	return r.GetDB().WithContext(ctx).Exec(`
		UPDATE groups 
		SET attendance_count = (
			SELECT COUNT(*) 
			FROM attendances 
			WHERE event_id IN (
				SELECT id 
				FROM events 
				WHERE group_id = ?
			)
		),
		average_attendance = (
			SELECT COALESCE(AVG(attendance_count), 0)
			FROM (
				SELECT COUNT(*) as attendance_count
				FROM attendances a
				JOIN events e ON a.event_id = e.id
				WHERE e.group_id = ?
				GROUP BY e.id
			) subquery
		)
		WHERE id = ?
	`, groupID, groupID, groupID).Error
}

func (r *groupRepository) IncrementMeetingCount(ctx context.Context, groupID string) error {
	return r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("id = ?", groupID).
		UpdateColumn("meeting_count", gorm.Expr("meeting_count + ?", 1)).Error
}

// Operações de busca avançada
func (r *groupRepository) Search(ctx context.Context, query string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	searchQuery := r.GetDB().WithContext(ctx).Where(
		"name ILIKE ? OR description ILIKE ? OR category ILIKE ? OR location ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%",
	)
	searchQuery = repository.ApplyFilter(searchQuery, filter)
	err := searchQuery.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByTags(ctx context.Context, tags []string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("tags && ?", tags)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByAgeRange(ctx context.Context, minAge int, maxAge int, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where(
		"(min_age <= ? OR min_age = 0) AND (max_age >= ? OR max_age = 0)",
		maxAge, minAge,
	)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByGender(ctx context.Context, gender string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("gender = ? OR gender = ''", gender)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByMeetingDay(ctx context.Context, day string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("meeting_day = ?", day)
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

func (r *groupRepository) FindByLocation(ctx context.Context, location string, filter *repository.Filter) ([]*domain.Group, error) {
	var groups []*domain.Group
	query := r.GetDB().WithContext(ctx).Where("location ILIKE ?", "%"+location+"%")
	query = repository.ApplyFilter(query, filter)
	err := query.Find(&groups).Error
	return groups, err
}

// Operações de validação
func (r *groupRepository) ValidateGroupName(ctx context.Context, communityID string, name string) (bool, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("community_id = ? AND name = ?", communityID, name).
		Count(&count).Error
	return count == 0, err
}

func (r *groupRepository) ValidateMembershipRequirements(ctx context.Context, groupID string, memberID string) (bool, error) {
	var group domain.Group
	if err := r.GetDB().WithContext(ctx).First(&group, "id = ?", groupID).Error; err != nil {
		return false, err
	}

	var member domain.Member
	if err := r.GetDB().WithContext(ctx).First(&member, "id = ?", memberID).Error; err != nil {
		return false, err
	}

	// Verificar restrições de idade
	if group.HasAgeRestriction() {
		age := member.Age()
		if (group.MinAge > 0 && age < group.MinAge) || (group.MaxAge > 0 && age > group.MaxAge) {
			return false, nil
		}
	}

	// Verificar restrições de gênero
	if group.HasGenderRestriction() && group.Gender != member.Gender {
		return false, nil
	}

	// Verificar se o grupo está ativo e tem vagas
	if !group.IsActive() || !group.HasSpace() {
		return false, nil
	}

	return true, nil
}

// Operações de contagem
func (r *groupRepository) CountMembers(ctx context.Context, groupID string) (int, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Member{}).
		Joins("JOIN group_members ON members.id = group_members.member_id").
		Where("group_members.group_id = ?", groupID).
		Count(&count).Error
	return int(count), err
}

func (r *groupRepository) CountGroups(ctx context.Context, filter *repository.Filter) (int, error) {
	var count int64
	query := r.GetDB().WithContext(ctx).Model(&domain.Group{})
	query = repository.ApplyFilter(query, filter)
	err := query.Count(&count).Error
	return int(count), err
}

func (r *groupRepository) CountGroupsByType(ctx context.Context, groupType string) (int, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("type = ?", groupType).
		Count(&count).Error
	return int(count), err
}

func (r *groupRepository) CountGroupsByCategory(ctx context.Context, category string) (int, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Group{}).
		Where("category = ?", category).
		Count(&count).Error
	return int(count), err
}

// GetDB retorna a instância do banco de dados
// func (r *groupRepository) GetDB() *gorm.DB {
// 	return r.GetDB()
// }
