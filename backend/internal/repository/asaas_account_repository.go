package repository

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// AsaasAccountRepository interface
type AsaasAccountRepository interface {
	Repository
	Create(ctx context.Context, account *domain.AsaasAccount) error
	Update(ctx context.Context, account *domain.AsaasAccount) error
	Delete(ctx context.Context, communityID, accountID string) error
	FindByID(ctx context.Context, communityID, accountID string) (*domain.AsaasAccount, error)
	FindByCommunityID(ctx context.Context, communityID string) (*domain.AsaasAccount, error)
	List(ctx context.Context, filter *Filter) ([]*domain.AsaasAccount, int64, error)
	FindByAsaasID(ctx context.Context, asaasID string) (*domain.AsaasAccount, error)
}

type asaasAccountRepository struct {
	BaseRepository
	logger *zap.Logger
}

// NewAsaasAccountRepository cria uma nova instância do repositório
func NewAsaasAccountRepository(db *gorm.DB, logger *zap.Logger) AsaasAccountRepository {
	return &asaasAccountRepository{
		BaseRepository: NewBaseRepository(db, logger),
		logger:         logger,
	}
}

func (r *asaasAccountRepository) Create(ctx context.Context, account *domain.AsaasAccount) error {
	return r.GetDB().WithContext(ctx).Create(account).Error
}

func (r *asaasAccountRepository) Update(ctx context.Context, account *domain.AsaasAccount) error {
	return r.GetDB().WithContext(ctx).Save(account).Error
}

func (r *asaasAccountRepository) Delete(ctx context.Context, communityID, accountID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, accountID).
		Delete(&domain.AsaasAccount{}).Error
}

func (r *asaasAccountRepository) FindByID(ctx context.Context, communityID, accountID string) (*domain.AsaasAccount, error) {
	var account domain.AsaasAccount
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, accountID).
		First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &account, nil
}

func (r *asaasAccountRepository) FindByCommunityID(ctx context.Context, communityID string) (*domain.AsaasAccount, error) {
	var account domain.AsaasAccount
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ?", communityID).
		First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &account, nil
}

func (r *asaasAccountRepository) List(ctx context.Context, filter *Filter) ([]*domain.AsaasAccount, int64, error) {
	var accounts []*domain.AsaasAccount
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.AsaasAccount{})

	// Aplica o filtro
	query = ApplyFilter(query, filter)

	// Conta o total de registros
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Busca os registros
	if err := query.Find(&accounts).Error; err != nil {
		return nil, 0, err
	}

	return accounts, total, nil
}

// FindByAsaasID busca uma conta pelo ID do ASAAS
func (r *asaasAccountRepository) FindByAsaasID(ctx context.Context, asaasID string) (*domain.AsaasAccount, error) {
	var account domain.AsaasAccount
	if err := r.GetDB().WithContext(ctx).
		Where("asaas_id = ?", asaasID).
		First(&account).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &account, nil
}
