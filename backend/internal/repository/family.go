package repository

import (
	"context"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type FamilyRepository interface {
	Create(ctx context.Context, family *domain.Family) error
	AddMember(ctx context.Context, familyMember *domain.FamilyMember) error
	FindByID(ctx context.Context, communityID, familyID string) (*domain.Family, error)
	ListByCommunity(ctx context.Context, communityID string) ([]*domain.Family, error)
	ListFamilyMembers(ctx context.Context, familyID string) ([]*domain.FamilyMember, error)
	ListFamilyMembersWithDetails(ctx context.Context, communityID, memberID string) ([]*domain.Member, error)
	Update(ctx context.Context, family *domain.Family) error
	Delete(ctx context.Context, communityID, familyID string) error
	RemoveMember(ctx context.Context, familyID, memberID string) error
	UpdateMemberRole(ctx context.Context, familyID, memberID, role string) error
	FindByMemberID(ctx context.Context, memberID string) (*domain.FamilyMember, error)
}

type familyRepository struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewFamilyRepository(db *gorm.DB, logger *zap.Logger) FamilyRepository {
	return &familyRepository{
		db:     db,
		logger: logger,
	}
}

// Create cria uma nova família
func (r *familyRepository) Create(ctx context.Context, family *domain.Family) error {
	family.ID = uuid.New().String()
	family.CreatedAt = time.Now()
	family.UpdatedAt = time.Now()

	return r.db.WithContext(ctx).Create(family).Error
}

// AddMember adiciona um membro à família
func (r *familyRepository) AddMember(ctx context.Context, familyMember *domain.FamilyMember) error {
	familyMember.ID = uuid.New().String()
	familyMember.CreatedAt = time.Now()
	familyMember.UpdatedAt = time.Now()

	return r.db.WithContext(ctx).Create(familyMember).Error
}

// FindByID busca uma família pelo ID
func (r *familyRepository) FindByID(ctx context.Context, communityID, familyID string) (*domain.Family, error) {
	var family domain.Family
	err := r.db.WithContext(ctx).
		Where("id = ? AND community_id = ?", familyID, communityID).
		First(&family).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &family, nil
}

// ListByCommunity lista todas as famílias de uma comunidade
func (r *familyRepository) ListByCommunity(ctx context.Context, communityID string) ([]*domain.Family, error) {
	var families []*domain.Family
	err := r.db.WithContext(ctx).
		Where("community_id = ?", communityID).
		Order("name").
		Find(&families).Error
	if err != nil {
		return nil, err
	}
	return families, nil
}

// ListFamilyMembers lista todos os membros de uma família
func (r *familyRepository) ListFamilyMembers(ctx context.Context, familyID string) ([]*domain.FamilyMember, error) {
	var members []*domain.FamilyMember
	err := r.db.WithContext(ctx).
		Where("family_id = ?", familyID).
		Find(&members).Error
	if err != nil {
		return nil, err
	}
	return members, nil
}

// ListFamilyMembersWithDetails lista todos os membros da família com detalhes completos
func (r *familyRepository) ListFamilyMembersWithDetails(ctx context.Context, communityID, memberID string) ([]*domain.Member, error) {
	// Primeiro, encontra a família do membro
	var familyMember domain.FamilyMember
	if err := r.db.WithContext(ctx).
		Where("member_id = ?", memberID).
		First(&familyMember).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	// Depois, busca todos os membros da família exceto o próprio membro
	var members []*domain.Member
	err := r.db.WithContext(ctx).
		Joins("JOIN family_members ON family_members.member_id = members.id").
		Where("family_members.family_id = ? AND members.id != ? AND members.community_id = ?",
			familyMember.FamilyID, memberID, communityID).
		Find(&members).Error
	if err != nil {
		return nil, err
	}

	return members, nil
}

// Update atualiza os dados de uma família
func (r *familyRepository) Update(ctx context.Context, family *domain.Family) error {
	family.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(family).Error
}

// Delete remove uma família
func (r *familyRepository) Delete(ctx context.Context, communityID, familyID string) error {
	return r.db.WithContext(ctx).
		Where("id = ? AND community_id = ?", familyID, communityID).
		Delete(&domain.Family{}).Error
}

// RemoveMember remove um membro da família
func (r *familyRepository) RemoveMember(ctx context.Context, familyID, memberID string) error {
	return r.db.WithContext(ctx).
		Where("family_id = ? AND member_id = ?", familyID, memberID).
		Delete(&domain.FamilyMember{}).Error
}

// UpdateMemberRole atualiza o papel de um membro na família
func (r *familyRepository) UpdateMemberRole(ctx context.Context, familyID, memberID, role string) error {
	return r.db.WithContext(ctx).Model(&domain.FamilyMember{}).
		Where("family_id = ? AND member_id = ?", familyID, memberID).
		Update("role", role).
		Update("updated_at", time.Now()).Error
}

// FindByMemberID busca a família de um membro
func (r *familyRepository) FindByMemberID(ctx context.Context, memberID string) (*domain.FamilyMember, error) {
	var familyMember domain.FamilyMember
	err := r.db.WithContext(ctx).
		Where("member_id = ?", memberID).
		First(&familyMember).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &familyMember, nil
}
