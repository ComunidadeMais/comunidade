package repository

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// AsaasConfigRepository define as operações do repositório de configurações do Asaas
type AsaasConfigRepository interface {
	Repository
	Create(ctx context.Context, config *domain.AsaasConfig) error
	Update(ctx context.Context, config *domain.AsaasConfig) error
	Delete(ctx context.Context, id string) error
	FindByID(ctx context.Context, id string) (*domain.AsaasConfig, error)
	FindByCommunityID(ctx context.Context, communityID string) (*domain.AsaasConfig, error)
}

// CampaignRepository define as operações do repositório de campanhas
type CampaignRepository interface {
	Repository
	Create(ctx context.Context, campaign *domain.Campaign) error
	Update(ctx context.Context, campaign *domain.Campaign) error
	Delete(ctx context.Context, communityID, id string) error
	FindByID(ctx context.Context, communityID, id string) (*domain.Campaign, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Campaign, error)
	CountByCommunityID(ctx context.Context, communityID string) (int64, error)
}

// DonationRepository define as operações do repositório de doações
type DonationRepository interface {
	Repository
	Create(ctx context.Context, donation *domain.Donation) error
	Update(ctx context.Context, donation *domain.Donation) error
	Delete(ctx context.Context, communityID, id string) error
	FindByID(ctx context.Context, communityID, id string) (*domain.Donation, error)
	FindByAsaasID(ctx context.Context, communityID, asaasID string) (*domain.Donation, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Donation, error)
	CountByCommunityID(ctx context.Context, communityID string) (int64, error)
	CountByCampaign(ctx context.Context, communityID, campaignID string) (int64, error)
	SumAmountByCampaign(ctx context.Context, communityID, campaignID string) (float64, error)
}

// RecurringDonationRepository define as operações do repositório de doações recorrentes
type RecurringDonationRepository interface {
	Repository
	Create(ctx context.Context, donation *domain.RecurringDonation) error
	Update(ctx context.Context, donation *domain.RecurringDonation) error
	Delete(ctx context.Context, communityID, id string) error
	FindByID(ctx context.Context, communityID, id string) (*domain.RecurringDonation, error)
	FindByAsaasID(ctx context.Context, communityID, asaasID string) (*domain.RecurringDonation, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.RecurringDonation, error)
	CountByCommunityID(ctx context.Context, communityID string) (int64, error)
	CountByCampaign(ctx context.Context, communityID, campaignID string) (int64, error)
	SumAmountByCampaign(ctx context.Context, communityID, campaignID string) (float64, error)
}

type asaasConfigRepository struct {
	BaseRepository
}

func NewAsaasConfigRepository(db *gorm.DB, logger *zap.Logger) AsaasConfigRepository {
	return &asaasConfigRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *asaasConfigRepository) Create(ctx context.Context, config *domain.AsaasConfig) error {
	return r.GetDB().WithContext(ctx).Create(config).Error
}

func (r *asaasConfigRepository) Update(ctx context.Context, config *domain.AsaasConfig) error {
	return r.GetDB().WithContext(ctx).Save(config).Error
}

func (r *asaasConfigRepository) Delete(ctx context.Context, id string) error {
	return r.GetDB().WithContext(ctx).Delete(&domain.AsaasConfig{}, "id = ?", id).Error
}

func (r *asaasConfigRepository) FindByID(ctx context.Context, id string) (*domain.AsaasConfig, error) {
	var config domain.AsaasConfig
	if err := r.GetDB().WithContext(ctx).First(&config, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &config, nil
}

func (r *asaasConfigRepository) FindByCommunityID(ctx context.Context, communityID string) (*domain.AsaasConfig, error) {
	var config domain.AsaasConfig
	if err := r.GetDB().WithContext(ctx).First(&config, "community_id = ?", communityID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &config, nil
}

type campaignRepository struct {
	BaseRepository
}

func NewCampaignRepository(db *gorm.DB, logger *zap.Logger) CampaignRepository {
	return &campaignRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *campaignRepository) Create(ctx context.Context, campaign *domain.Campaign) error {
	return r.GetDB().WithContext(ctx).Create(campaign).Error
}

func (r *campaignRepository) Update(ctx context.Context, campaign *domain.Campaign) error {
	return r.GetDB().WithContext(ctx).Save(campaign).Error
}

func (r *campaignRepository) Delete(ctx context.Context, communityID, id string) error {
	return r.GetDB().WithContext(ctx).Delete(&domain.Campaign{}, "community_id = ? AND id = ?", communityID, id).Error
}

func (r *campaignRepository) FindByID(ctx context.Context, communityID, id string) (*domain.Campaign, error) {
	var campaign domain.Campaign
	if err := r.GetDB().WithContext(ctx).First(&campaign, "community_id = ? AND id = ?", communityID, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &campaign, nil
}

func (r *campaignRepository) FindByCommunity(ctx context.Context, communityID string, filter *Filter) ([]*domain.Campaign, int64, error) {
	var campaigns []*domain.Campaign
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Campaign{}).
		Where("community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&campaigns).Error; err != nil {
		return nil, 0, err
	}

	return campaigns, total, nil
}

func (r *campaignRepository) CountByCommunityID(ctx context.Context, communityID string) (int64, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Campaign{}).Where("community_id = ?", communityID).Count(&count).Error
	return count, err
}

func (r *campaignRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Campaign, error) {
	var campaigns []*domain.Campaign
	query := r.GetDB().WithContext(ctx).Where("community_id = ?", communityID)

	if filter != nil {
		query = ApplyFilter(query, filter)
	}

	if err := query.Find(&campaigns).Error; err != nil {
		return nil, err
	}
	return campaigns, nil
}

type donationRepository struct {
	BaseRepository
}

func NewDonationRepository(db *gorm.DB, logger *zap.Logger) DonationRepository {
	return &donationRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *donationRepository) Create(ctx context.Context, donation *domain.Donation) error {
	return r.GetDB().WithContext(ctx).Create(donation).Error
}

func (r *donationRepository) Update(ctx context.Context, donation *domain.Donation) error {
	return r.GetDB().WithContext(ctx).Save(donation).Error
}

func (r *donationRepository) Delete(ctx context.Context, communityID, id string) error {
	return r.GetDB().WithContext(ctx).Delete(&domain.Donation{}, "community_id = ? AND id = ?", communityID, id).Error
}

func (r *donationRepository) FindByID(ctx context.Context, communityID, id string) (*domain.Donation, error) {
	var donation domain.Donation
	if err := r.GetDB().WithContext(ctx).First(&donation, "community_id = ? AND id = ?", communityID, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &donation, nil
}

func (r *donationRepository) FindByCommunity(ctx context.Context, communityID string, filter *Filter) ([]*domain.Donation, int64, error) {
	var donations []*domain.Donation
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Donation{}).
		Where("community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&donations).Error; err != nil {
		return nil, 0, err
	}

	return donations, total, nil
}

func (r *donationRepository) FindByCampaign(ctx context.Context, campaignID string, filter *Filter) ([]*domain.Donation, int64, error) {
	var donations []*domain.Donation
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Donation{}).
		Where("campaign_id = ?", campaignID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&donations).Error; err != nil {
		return nil, 0, err
	}

	return donations, total, nil
}

func (r *donationRepository) CountByCampaign(ctx context.Context, communityID, campaignID string) (int64, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Donation{}).Where("community_id = ? AND campaign_id = ?", communityID, campaignID).Count(&count).Error
	return count, err
}

func (r *donationRepository) SumAmountByCampaign(ctx context.Context, communityID, campaignID string) (float64, error) {
	var sum float64
	err := r.GetDB().WithContext(ctx).Model(&domain.Donation{}).
		Where("community_id = ? AND campaign_id = ? AND status = ?", communityID, campaignID, "paid").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&sum).Error
	return sum, err
}

func (r *donationRepository) CountByCommunityID(ctx context.Context, communityID string) (int64, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.Donation{}).Where("community_id = ?", communityID).Count(&count).Error
	return count, err
}

func (r *donationRepository) FindByAsaasID(ctx context.Context, communityID, asaasID string) (*domain.Donation, error) {
	var donation domain.Donation
	if err := r.GetDB().WithContext(ctx).First(&donation, "community_id = ? AND asaas_id = ?", communityID, asaasID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &donation, nil
}

func (r *donationRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Donation, error) {
	var donations []*domain.Donation
	query := r.GetDB().WithContext(ctx).Where("community_id = ?", communityID)

	if filter != nil {
		query = ApplyFilter(query, filter)
	}

	if err := query.Find(&donations).Error; err != nil {
		return nil, err
	}
	return donations, nil
}

type recurringDonationRepository struct {
	BaseRepository
}

func NewRecurringDonationRepository(db *gorm.DB, logger *zap.Logger) RecurringDonationRepository {
	return &recurringDonationRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

func (r *recurringDonationRepository) Create(ctx context.Context, donation *domain.RecurringDonation) error {
	return r.GetDB().WithContext(ctx).Create(donation).Error
}

func (r *recurringDonationRepository) Update(ctx context.Context, donation *domain.RecurringDonation) error {
	return r.GetDB().WithContext(ctx).Save(donation).Error
}

func (r *recurringDonationRepository) Delete(ctx context.Context, communityID, id string) error {
	return r.GetDB().WithContext(ctx).Delete(&domain.RecurringDonation{}, "community_id = ? AND id = ?", communityID, id).Error
}

func (r *recurringDonationRepository) FindByID(ctx context.Context, communityID, id string) (*domain.RecurringDonation, error) {
	var donation domain.RecurringDonation
	if err := r.GetDB().WithContext(ctx).First(&donation, "community_id = ? AND id = ?", communityID, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &donation, nil
}

func (r *recurringDonationRepository) FindByCommunity(ctx context.Context, communityID string, filter *Filter) ([]*domain.RecurringDonation, int64, error) {
	var donations []*domain.RecurringDonation
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.RecurringDonation{}).
		Where("community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&donations).Error; err != nil {
		return nil, 0, err
	}

	return donations, total, nil
}

func (r *recurringDonationRepository) FindByCampaign(ctx context.Context, campaignID string, filter *Filter) ([]*domain.RecurringDonation, int64, error) {
	var donations []*domain.RecurringDonation
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.RecurringDonation{}).
		Where("campaign_id = ?", campaignID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&donations).Error; err != nil {
		return nil, 0, err
	}

	return donations, total, nil
}

func (r *recurringDonationRepository) CountByCampaign(ctx context.Context, communityID, campaignID string) (int64, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.RecurringDonation{}).Where("community_id = ? AND campaign_id = ?", communityID, campaignID).Count(&count).Error
	return count, err
}

func (r *recurringDonationRepository) SumAmountByCampaign(ctx context.Context, communityID, campaignID string) (float64, error) {
	var sum float64
	err := r.GetDB().WithContext(ctx).Model(&domain.RecurringDonation{}).
		Where("community_id = ? AND campaign_id = ? AND status = ?", communityID, campaignID, "active").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&sum).Error
	return sum, err
}

func (r *recurringDonationRepository) CountByCommunityID(ctx context.Context, communityID string) (int64, error) {
	var count int64
	err := r.GetDB().WithContext(ctx).Model(&domain.RecurringDonation{}).Where("community_id = ?", communityID).Count(&count).Error
	return count, err
}

func (r *recurringDonationRepository) FindByAsaasID(ctx context.Context, communityID, asaasID string) (*domain.RecurringDonation, error) {
	var donation domain.RecurringDonation
	if err := r.GetDB().WithContext(ctx).First(&donation, "community_id = ? AND asaas_id = ?", communityID, asaasID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &donation, nil
}

func (r *recurringDonationRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.RecurringDonation, error) {
	var donations []*domain.RecurringDonation
	query := r.GetDB().WithContext(ctx).Where("community_id = ?", communityID)

	if filter != nil {
		query = ApplyFilter(query, filter)
	}

	if err := query.Find(&donations).Error; err != nil {
		return nil, err
	}
	return donations, nil
}
