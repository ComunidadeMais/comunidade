package repository

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repositories struct {
	User              UserRepository
	Community         CommunityRepository
	Member            MemberRepository
	Group             GroupRepository
	Event             EventRepository
	Family            FamilyRepository
	Communication     CommunicationRepository
	CheckIn           CheckInRepository
	FinancialCategory FinancialCategoryRepository
	Supplier          SupplierRepository
	Expense           ExpenseRepository
	Revenue           RevenueRepository
	FinancialReport   FinancialReportRepository
}

func NewRepositories(db *gorm.DB, logger *zap.Logger) *Repositories {
	return &Repositories{
		User:              NewUserRepository(db, logger),
		Community:         NewCommunityRepository(db, logger),
		Member:            NewMemberRepository(db, logger),
		Group:             NewGroupRepository(db, logger),
		Event:             NewEventRepository(db, logger),
		Family:            NewFamilyRepository(db, logger),
		Communication:     NewCommunicationRepository(db, logger),
		CheckIn:           NewCheckInRepository(db, logger),
		FinancialCategory: NewFinancialCategoryRepository(db, logger),
		Supplier:          NewSupplierRepository(db, logger),
		Expense:           NewExpenseRepository(db, logger),
		Revenue:           NewRevenueRepository(db, logger),
		FinancialReport:   NewFinancialReportRepository(db, logger),
	}
}
