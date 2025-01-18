package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FinancialCategory representa uma categoria financeira (despesa ou receita)
type FinancialCategory struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string    `json:"community_id" gorm:"type:uuid;not null"`
	UserID      string    `json:"user_id" gorm:"type:uuid;not null"`
	Name        string    `json:"name" gorm:"not null"`
	Type        string    `json:"type" gorm:"not null;check:type IN ('expense', 'revenue')"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"not null"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// Supplier representa um fornecedor
type Supplier struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string    `json:"community_id" gorm:"type:uuid;not null"`
	UserID      string    `json:"user_id" gorm:"type:uuid;not null"`
	Name        string    `json:"name" gorm:"not null"`
	CNPJ        string    `json:"cnpj" gorm:"type:varchar(14)"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	Address     string    `json:"address"`
	City        string    `json:"city"`
	State       string    `json:"state"`
	ZipCode     string    `json:"zip_code"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"not null"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Expenses  []*Expense `json:"expenses,omitempty" gorm:"foreignKey:SupplierID"`
}

// Expense representa uma despesa
type Expense struct {
	ID          string     `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string     `json:"community_id" gorm:"type:uuid;not null"`
	UserID      string     `json:"user_id" gorm:"type:uuid;not null"`
	CategoryID  string     `json:"category_id" gorm:"type:uuid;not null"`
	SupplierID  *string    `json:"supplier_id" gorm:"type:uuid"`
	EventID     *string    `json:"event_id" gorm:"type:uuid"`
	Amount      float64    `json:"amount" gorm:"type:decimal(10,2);not null"`
	Date        time.Time  `json:"date" gorm:"not null"`
	Description string     `json:"description"`
	Status      string     `json:"status" gorm:"not null;default:'pending';check:status IN ('pending', 'paid', 'cancelled')"`
	PaymentType string     `json:"payment_type" gorm:"type:varchar(50)"`
	DueDate     time.Time  `json:"due_date"`
	PaidAt      *time.Time `json:"paid_at"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`

	Community *Community         `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User              `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Category  *FinancialCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Supplier  *Supplier          `json:"supplier,omitempty" gorm:"foreignKey:SupplierID"`
	Event     *Event             `json:"event,omitempty" gorm:"foreignKey:EventID"`
}

// Revenue representa uma receita
type Revenue struct {
	ID          string     `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string     `json:"community_id" gorm:"type:uuid;not null"`
	UserID      string     `json:"user_id" gorm:"type:uuid;not null"`
	CategoryID  string     `json:"category_id" gorm:"type:uuid;not null"`
	EventID     *string    `json:"event_id" gorm:"type:uuid"`
	Amount      float64    `json:"amount" gorm:"type:decimal(10,2);not null"`
	Date        time.Time  `json:"date" gorm:"not null"`
	Description string     `json:"description"`
	Status      string     `json:"status" gorm:"not null;default:'pending';check:status IN ('pending', 'received', 'cancelled')"`
	PaymentType string     `json:"payment_type" gorm:"type:varchar(50)"`
	ReceivedAt  *time.Time `json:"received_at"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`

	Community *Community         `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User              `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Category  *FinancialCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Event     *Event             `json:"event,omitempty" gorm:"foreignKey:EventID"`
}

// FinancialReport representa um relatório financeiro
type FinancialReport struct {
	ID           string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID  string    `json:"community_id" gorm:"type:uuid;not null"`
	UserID       string    `json:"user_id" gorm:"type:uuid;not null"`
	Type         string    `json:"type" gorm:"not null;check:type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')"`
	StartDate    time.Time `json:"start_date" gorm:"not null"`
	EndDate      time.Time `json:"end_date" gorm:"not null"`
	TotalRevenue float64   `json:"total_revenue" gorm:"type:decimal(10,2);not null"`
	TotalExpense float64   `json:"total_expense" gorm:"type:decimal(10,2);not null"`
	Balance      float64   `json:"balance" gorm:"type:decimal(10,2);not null"`
	CreatedAt    time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"not null"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate - Hooks para geração de IDs
func (fc *FinancialCategory) BeforeCreate(tx *gorm.DB) error {
	if fc.ID == "" {
		fc.ID = uuid.New().String()
	}
	return nil
}

func (s *Supplier) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return nil
}

func (e *Expense) BeforeCreate(tx *gorm.DB) error {
	if e.ID == "" {
		e.ID = uuid.New().String()
	}
	return nil
}

func (r *Revenue) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

func (fr *FinancialReport) BeforeCreate(tx *gorm.DB) error {
	if fr.ID == "" {
		fr.ID = uuid.New().String()
	}
	return nil
}
