package domain

import (
	"time"

	"gorm.io/gorm"
)

type Contribution struct {
	ID          string         `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	CommunityID string         `gorm:"type:uuid;not null" json:"community_id"`
	MemberID    string         `gorm:"type:uuid;not null" json:"member_id"`
	BatchID     string         `gorm:"type:uuid" json:"batch_id"`
	Type        string         `gorm:"type:varchar(50);not null;check:type IN ('tithe', 'offering', 'donation')" json:"type"`
	Amount      float64        `gorm:"type:decimal(10,2);not null" json:"amount"`
	Currency    string         `gorm:"type:varchar(3);not null;default:'BRL'" json:"currency"`
	Date        time.Time      `gorm:"type:date;not null" json:"date"`
	Method      string         `gorm:"type:varchar(50);not null;check:method IN ('cash', 'check', 'credit_card', 'bank_transfer')" json:"method"`
	Status      string         `gorm:"type:varchar(50);not null;default:'pending';check:status IN ('pending', 'completed', 'failed', 'refunded')" json:"status"`
	Notes       string         `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relacionamentos
	Community Community         `gorm:"foreignKey:CommunityID" json:"-"`
	Member    Member            `gorm:"foreignKey:MemberID" json:"-"`
	Batch     ContributionBatch `gorm:"foreignKey:BatchID" json:"-"`
}

type ContributionBatch struct {
	ID          string         `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	CommunityID string         `gorm:"type:uuid;not null" json:"community_id"`
	Date        time.Time      `gorm:"type:date;not null" json:"date"`
	Total       float64        `gorm:"type:decimal(10,2);not null;default:0" json:"total"`
	Count       int            `gorm:"not null;default:0" json:"count"`
	Status      string         `gorm:"type:varchar(50);not null;default:'open';check:status IN ('open', 'closed')" json:"status"`
	Notes       string         `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relacionamentos
	Community     Community      `gorm:"foreignKey:CommunityID" json:"-"`
	Contributions []Contribution `gorm:"foreignKey:BatchID" json:"-"`
}

func (c *Contribution) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		tx.Statement.SetColumn("ID", tx.Statement.Context.Value("uuid").(string))
	}
	return nil
}

func (c *ContributionBatch) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		tx.Statement.SetColumn("ID", tx.Statement.Context.Value("uuid").(string))
	}
	return nil
}

func (c *Contribution) IsPending() bool {
	return c.Status == "pending"
}

func (c *Contribution) IsCompleted() bool {
	return c.Status == "completed"
}

func (c *Contribution) IsFailed() bool {
	return c.Status == "failed"
}

func (c *Contribution) IsRefunded() bool {
	return c.Status == "refunded"
}

func (c *Contribution) IsTithe() bool {
	return c.Type == "tithe"
}

func (c *Contribution) IsOffering() bool {
	return c.Type == "offering"
}

func (c *Contribution) IsDonation() bool {
	return c.Type == "donation"
}
