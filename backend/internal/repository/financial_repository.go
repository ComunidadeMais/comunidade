package repository

import (
	"context"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// FinancialCategoryRepository interface
type FinancialCategoryRepository interface {
	Repository
	Create(ctx context.Context, category *domain.FinancialCategory) error
	Update(ctx context.Context, category *domain.FinancialCategory) error
	Delete(ctx context.Context, communityID, categoryID string) error
	FindByID(ctx context.Context, communityID, categoryID string) (*domain.FinancialCategory, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.FinancialCategory, int64, error)
}

// SupplierRepository interface
type SupplierRepository interface {
	Repository
	Create(ctx context.Context, supplier *domain.Supplier) error
	Update(ctx context.Context, supplier *domain.Supplier) error
	Delete(ctx context.Context, communityID, supplierID string) error
	FindByID(ctx context.Context, communityID, supplierID string) (*domain.Supplier, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Supplier, int64, error)
}

// ExpenseRepository interface
type ExpenseRepository interface {
	Repository
	Create(ctx context.Context, expense *domain.Expense) error
	Update(ctx context.Context, expense *domain.Expense) error
	Delete(ctx context.Context, communityID, expenseID string) error
	FindByID(ctx context.Context, communityID, expenseID string) (*domain.Expense, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Expense, int64, error)
	GetTotalByPeriod(ctx context.Context, communityID string, startDate, endDate time.Time) (float64, error)
	GetTotalByCategory(ctx context.Context, communityID string, categoryID string, startDate, endDate time.Time) (float64, error)
	CountByCategory(ctx context.Context, communityID, categoryID string) (int64, error)
	CountBySupplier(ctx context.Context, communityID, supplierID string) (int64, error)
}

// RevenueRepository interface
type RevenueRepository interface {
	Repository
	Create(ctx context.Context, revenue *domain.Revenue) error
	Update(ctx context.Context, revenue *domain.Revenue) error
	Delete(ctx context.Context, communityID, revenueID string) error
	FindByID(ctx context.Context, communityID, revenueID string) (*domain.Revenue, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Revenue, int64, error)
	GetTotalByPeriod(ctx context.Context, communityID string, startDate, endDate time.Time) (float64, error)
	GetTotalByCategory(ctx context.Context, communityID string, categoryID string, startDate, endDate time.Time) (float64, error)
	CountByCategory(ctx context.Context, communityID, categoryID string) (int64, error)
}

// FinancialReportRepository interface
type FinancialReportRepository interface {
	Repository
	Create(ctx context.Context, report *domain.FinancialReport) error
	FindByID(ctx context.Context, communityID, reportID string) (*domain.FinancialReport, error)
	List(ctx context.Context, communityID string, filter *Filter) ([]*domain.FinancialReport, int64, error)
	GenerateReport(ctx context.Context, communityID string, userID string, startDate, endDate time.Time) (*domain.FinancialReport, error)
}

// Implementações concretas
type financialCategoryRepository struct {
	BaseRepository
	logger *zap.Logger
}

type supplierRepository struct {
	BaseRepository
	logger *zap.Logger
}

type expenseRepository struct {
	BaseRepository
	logger *zap.Logger
}

type revenueRepository struct {
	BaseRepository
	logger *zap.Logger
}

type financialReportRepository struct {
	BaseRepository
	logger *zap.Logger
}

// Construtores
func NewFinancialCategoryRepository(db *gorm.DB, logger *zap.Logger) FinancialCategoryRepository {
	return &financialCategoryRepository{
		BaseRepository: NewBaseRepository(db, logger),
		logger:         logger,
	}
}

func NewSupplierRepository(db *gorm.DB, logger *zap.Logger) SupplierRepository {
	return &supplierRepository{
		BaseRepository: NewBaseRepository(db, logger),
		logger:         logger,
	}
}

func NewExpenseRepository(db *gorm.DB, logger *zap.Logger) ExpenseRepository {
	return &expenseRepository{
		BaseRepository: NewBaseRepository(db, logger),
		logger:         logger,
	}
}

func NewRevenueRepository(db *gorm.DB, logger *zap.Logger) RevenueRepository {
	return &revenueRepository{
		BaseRepository: NewBaseRepository(db, logger),
		logger:         logger,
	}
}

func NewFinancialReportRepository(db *gorm.DB, logger *zap.Logger) FinancialReportRepository {
	return &financialReportRepository{
		BaseRepository: NewBaseRepository(db, logger),
		logger:         logger,
	}
}

// Implementações dos métodos do FinancialCategoryRepository
func (r *financialCategoryRepository) Create(ctx context.Context, category *domain.FinancialCategory) error {
	return r.GetDB().WithContext(ctx).Create(category).Error
}

func (r *financialCategoryRepository) Update(ctx context.Context, category *domain.FinancialCategory) error {
	return r.GetDB().WithContext(ctx).Save(category).Error
}

func (r *financialCategoryRepository) Delete(ctx context.Context, communityID, categoryID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, categoryID).
		Delete(&domain.FinancialCategory{}).Error
}

func (r *financialCategoryRepository) FindByID(ctx context.Context, communityID, categoryID string) (*domain.FinancialCategory, error) {
	var category domain.FinancialCategory
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, categoryID).
		First(&category).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *financialCategoryRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.FinancialCategory, int64, error) {
	var categories []*domain.FinancialCategory
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.FinancialCategory{}).
		Where("community_id = ?", communityID)

	if filter != nil && filter.Search != "" {
		query = query.Where("name ILIKE ?", "%"+filter.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter != nil {
		if filter.OrderBy != "" {
			query = query.Order(filter.OrderBy + " " + filter.OrderDir)
		}
		query = query.Offset((filter.Page - 1) * filter.PerPage).Limit(filter.PerPage)
	}

	if err := query.Find(&categories).Error; err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

// Implementações dos métodos do SupplierRepository
func (r *supplierRepository) Create(ctx context.Context, supplier *domain.Supplier) error {
	return r.GetDB().WithContext(ctx).Create(supplier).Error
}

func (r *supplierRepository) Update(ctx context.Context, supplier *domain.Supplier) error {
	return r.GetDB().WithContext(ctx).Save(supplier).Error
}

func (r *supplierRepository) Delete(ctx context.Context, communityID, supplierID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, supplierID).
		Delete(&domain.Supplier{}).Error
}

func (r *supplierRepository) FindByID(ctx context.Context, communityID, supplierID string) (*domain.Supplier, error) {
	var supplier domain.Supplier
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, supplierID).
		First(&supplier).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &supplier, nil
}

func (r *supplierRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Supplier, int64, error) {
	var suppliers []*domain.Supplier
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Supplier{}).
		Where("community_id = ?", communityID)

	if filter != nil && filter.Search != "" {
		query = query.Where("name ILIKE ? OR cnpj ILIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter != nil {
		if filter.OrderBy != "" {
			query = query.Order(filter.OrderBy + " " + filter.OrderDir)
		}
		query = query.Offset((filter.Page - 1) * filter.PerPage).Limit(filter.PerPage)
	}

	if err := query.Find(&suppliers).Error; err != nil {
		return nil, 0, err
	}

	return suppliers, total, nil
}

// Implementações dos métodos do ExpenseRepository
func (r *expenseRepository) Create(ctx context.Context, expense *domain.Expense) error {
	return r.GetDB().WithContext(ctx).Create(expense).Error
}

func (r *expenseRepository) Update(ctx context.Context, expense *domain.Expense) error {
	return r.GetDB().WithContext(ctx).Save(expense).Error
}

func (r *expenseRepository) Delete(ctx context.Context, communityID, expenseID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, expenseID).
		Delete(&domain.Expense{}).Error
}

func (r *expenseRepository) FindByID(ctx context.Context, communityID, expenseID string) (*domain.Expense, error) {
	var expense domain.Expense
	if err := r.GetDB().WithContext(ctx).
		Preload("Category").
		Preload("Supplier").
		Preload("Event").
		Where("community_id = ? AND id = ?", communityID, expenseID).
		First(&expense).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &expense, nil
}

func (r *expenseRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Expense, int64, error) {
	var expenses []*domain.Expense
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Expense{}).
		Preload("Category").
		Preload("Supplier").
		Preload("Event").
		Where("community_id = ?", communityID)

	if filter != nil && filter.Search != "" {
		query = query.Where("description ILIKE ?", "%"+filter.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter != nil {
		if filter.OrderBy != "" {
			query = query.Order(filter.OrderBy + " " + filter.OrderDir)
		}
		query = query.Offset((filter.Page - 1) * filter.PerPage).Limit(filter.PerPage)
	}

	if err := query.Find(&expenses).Error; err != nil {
		return nil, 0, err
	}

	return expenses, total, nil
}

func (r *expenseRepository) GetTotalByPeriod(ctx context.Context, communityID string, startDate, endDate time.Time) (float64, error) {
	var total float64
	err := r.GetDB().WithContext(ctx).Model(&domain.Expense{}).
		Where("community_id = ? AND date BETWEEN ? AND ?", communityID, startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	return total, err
}

func (r *expenseRepository) GetTotalByCategory(ctx context.Context, communityID string, categoryID string, startDate, endDate time.Time) (float64, error) {
	var total float64
	err := r.GetDB().WithContext(ctx).Model(&domain.Expense{}).
		Where("community_id = ? AND category_id = ? AND date BETWEEN ? AND ?", communityID, categoryID, startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	return total, err
}

func (r *expenseRepository) CountByCategory(ctx context.Context, communityID, categoryID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Expense{}).
		Where("community_id = ? AND category_id = ?", communityID, categoryID).
		Count(&count).Error
	if err != nil {
		r.logger.Error("erro ao contar despesas por categoria",
			zap.Error(err),
			zap.String("community_id", communityID),
			zap.String("category_id", categoryID))
		return 0, err
	}
	return count, nil
}

func (r *expenseRepository) CountBySupplier(ctx context.Context, communityID, supplierID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Expense{}).
		Where("community_id = ? AND supplier_id = ?", communityID, supplierID).
		Count(&count).Error
	if err != nil {
		r.logger.Error("erro ao contar despesas por fornecedor",
			zap.Error(err),
			zap.String("community_id", communityID),
			zap.String("supplier_id", supplierID))
		return 0, err
	}
	return count, nil
}

// Implementações dos métodos do RevenueRepository
func (r *revenueRepository) Create(ctx context.Context, revenue *domain.Revenue) error {
	return r.GetDB().WithContext(ctx).Create(revenue).Error
}

func (r *revenueRepository) Update(ctx context.Context, revenue *domain.Revenue) error {
	return r.GetDB().WithContext(ctx).Save(revenue).Error
}

func (r *revenueRepository) Delete(ctx context.Context, communityID, revenueID string) error {
	return r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, revenueID).
		Delete(&domain.Revenue{}).Error
}

func (r *revenueRepository) FindByID(ctx context.Context, communityID, revenueID string) (*domain.Revenue, error) {
	var revenue domain.Revenue
	if err := r.GetDB().WithContext(ctx).
		Preload("Category").
		Preload("Event").
		Where("community_id = ? AND id = ?", communityID, revenueID).
		First(&revenue).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &revenue, nil
}

func (r *revenueRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.Revenue, int64, error) {
	var revenues []*domain.Revenue
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.Revenue{}).
		Preload("Category").
		Preload("Event").
		Where("community_id = ?", communityID)

	if filter != nil && filter.Search != "" {
		query = query.Where("description ILIKE ?", "%"+filter.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter != nil {
		if filter.OrderBy != "" {
			query = query.Order(filter.OrderBy + " " + filter.OrderDir)
		}
		query = query.Offset((filter.Page - 1) * filter.PerPage).Limit(filter.PerPage)
	}

	if err := query.Find(&revenues).Error; err != nil {
		return nil, 0, err
	}

	return revenues, total, nil
}

func (r *revenueRepository) GetTotalByPeriod(ctx context.Context, communityID string, startDate, endDate time.Time) (float64, error) {
	var total float64
	err := r.GetDB().WithContext(ctx).Model(&domain.Revenue{}).
		Where("community_id = ? AND date BETWEEN ? AND ?", communityID, startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	return total, err
}

func (r *revenueRepository) GetTotalByCategory(ctx context.Context, communityID string, categoryID string, startDate, endDate time.Time) (float64, error) {
	var total float64
	err := r.GetDB().WithContext(ctx).Model(&domain.Revenue{}).
		Where("community_id = ? AND category_id = ? AND date BETWEEN ? AND ?", communityID, categoryID, startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	return total, err
}

func (r *revenueRepository) CountByCategory(ctx context.Context, communityID, categoryID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Revenue{}).
		Where("community_id = ? AND category_id = ?", communityID, categoryID).
		Count(&count).Error
	if err != nil {
		r.logger.Error("erro ao contar receitas por categoria",
			zap.Error(err),
			zap.String("community_id", communityID),
			zap.String("category_id", categoryID))
		return 0, err
	}
	return count, nil
}

// Implementações dos métodos do FinancialReportRepository
func (r *financialReportRepository) Create(ctx context.Context, report *domain.FinancialReport) error {
	return r.GetDB().WithContext(ctx).Create(report).Error
}

func (r *financialReportRepository) FindByID(ctx context.Context, communityID, reportID string) (*domain.FinancialReport, error) {
	var report domain.FinancialReport
	if err := r.GetDB().WithContext(ctx).
		Where("community_id = ? AND id = ?", communityID, reportID).
		First(&report).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &report, nil
}

func (r *financialReportRepository) List(ctx context.Context, communityID string, filter *Filter) ([]*domain.FinancialReport, int64, error) {
	var reports []*domain.FinancialReport
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.FinancialReport{}).
		Where("community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter != nil {
		if filter.OrderBy != "" {
			query = query.Order(filter.OrderBy + " " + filter.OrderDir)
		}
		query = query.Offset((filter.Page - 1) * filter.PerPage).Limit(filter.PerPage)
	}

	if err := query.Find(&reports).Error; err != nil {
		return nil, 0, err
	}

	return reports, total, nil
}

func (r *financialReportRepository) GenerateReport(ctx context.Context, communityID string, userID string, startDate, endDate time.Time) (*domain.FinancialReport, error) {
	var totalRevenue float64
	var totalExpense float64

	// Calcula o total de receitas
	if err := r.GetDB().WithContext(ctx).Model(&domain.Revenue{}).
		Where("community_id = ? AND date BETWEEN ? AND ?", communityID, startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalRevenue).Error; err != nil {
		return nil, err
	}

	// Calcula o total de despesas
	if err := r.GetDB().WithContext(ctx).Model(&domain.Expense{}).
		Where("community_id = ? AND date BETWEEN ? AND ?", communityID, startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalExpense).Error; err != nil {
		return nil, err
	}

	// Cria o relatório
	report := &domain.FinancialReport{
		CommunityID:  communityID,
		UserID:       userID,
		Type:         "custom",
		StartDate:    startDate,
		EndDate:      endDate,
		TotalRevenue: totalRevenue,
		TotalExpense: totalExpense,
		Balance:      totalRevenue - totalExpense,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Salva o relatório
	if err := r.GetDB().WithContext(ctx).Create(report).Error; err != nil {
		return nil, err
	}

	return report, nil
}
