package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AsaasConfig armazena as configurações da integração Asaas para cada comunidade
type AsaasConfig struct {
	ID           string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID  string    `json:"community_id" gorm:"type:uuid;not null"`
	ApiKey       string    `json:"api_key"`
	ApiEndpoint  string    `json:"api_endpoint"`
	WebhookToken string    `json:"webhook_token"`
	CreatedAt    time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"not null"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
}

// Campaign representa uma campanha de arrecadação
type Campaign struct {
	ID          string     `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string     `json:"community_id" gorm:"type:uuid;not null"`
	UserID      string     `json:"user_id" gorm:"type:uuid;not null"`
	Name        string     `json:"name" gorm:"not null"`
	Description string     `json:"description"`
	Goal        float64    `json:"goal" gorm:"type:decimal(10,2);not null"`
	StartDate   time.Time  `json:"start_date" gorm:"not null"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	EventID     *string    `json:"event_id,omitempty" gorm:"type:uuid"`
	Status      string     `json:"status" gorm:"not null;default:'active';check:status IN ('active', 'completed', 'cancelled')"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Event     *Event     `json:"event,omitempty" gorm:"foreignKey:EventID"`
}

// Donation representa uma doação única ou recorrente
type Donation struct {
	ID            string     `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID   string     `json:"community_id" gorm:"type:uuid;not null"`
	UserID        string     `json:"user_id" gorm:"type:uuid;not null"`
	MemberID      *string    `json:"member_id" gorm:"type:uuid"`
	CampaignID    string     `json:"campaign_id" gorm:"type:uuid"`
	Amount        float64    `json:"amount" gorm:"not null"`
	PaymentMethod string     `json:"payment_method" gorm:"not null;check:payment_method IN ('credit_card', 'boleto', 'pix')"`
	DueDate       time.Time  `json:"due_date" gorm:"not null"`
	Description   string     `json:"description"`
	Status        string     `json:"status" gorm:"not null;default:'pending';check:status IN ('pending', 'paid', 'cancelled', 'failed')"`
	AsaasID       string     `json:"asaas_id"`
	PaidAt        *time.Time `json:"paid_at"`
	CreatedAt     time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt     time.Time  `json:"updated_at" gorm:"not null"`

	CustomerName  string `json:"customer_name" gorm:"not null"`
	CustomerCPF   string `json:"customer_cpf" gorm:"not null"`
	CustomerEmail string `json:"customer_email" gorm:"not null"`
	CustomerPhone string `json:"customer_phone" gorm:"not null"`

	BillingAddress struct {
		Street     string `json:"street" gorm:"not null"`
		Number     string `json:"number" gorm:"not null"`
		Complement string `json:"complement"`
		District   string `json:"district" gorm:"not null"`
		City       string `json:"city" gorm:"not null"`
		State      string `json:"state" gorm:"not null"`
		ZipCode    string `json:"zip_code" gorm:"not null"`
	} `json:"billing_address" gorm:"embedded;embeddedPrefix:billing_"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Member    *Member    `json:"member,omitempty" gorm:"foreignKey:MemberID"`
	Campaign  *Campaign  `json:"campaign,omitempty" gorm:"foreignKey:CampaignID"`
}

// RecurringDonation representa uma doação recorrente (assinatura)
type RecurringDonation struct {
	ID            string     `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID   string     `json:"community_id" gorm:"type:uuid;not null"`
	UserID        string     `json:"user_id" gorm:"type:uuid;not null"`
	MemberID      *string    `json:"member_id" gorm:"type:uuid"`
	CampaignID    string     `json:"campaign_id" gorm:"type:uuid"`
	Amount        float64    `json:"amount" gorm:"not null"`
	PaymentMethod string     `json:"payment_method" gorm:"not null;check:payment_method IN ('credit_card')"`
	DueDay        int        `json:"due_day" gorm:"not null"`
	Description   string     `json:"description"`
	Status        string     `json:"status" gorm:"not null;default:'active';check:status IN ('active', 'cancelled', 'failed')"`
	AsaasID       string     `json:"asaas_id"`
	NextDueDate   *time.Time `json:"next_due_date"`
	CreatedAt     time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt     time.Time  `json:"updated_at" gorm:"not null"`

	CustomerName  string `json:"customer_name" gorm:"not null"`
	CustomerCPF   string `json:"customer_cpf" gorm:"not null"`
	CustomerEmail string `json:"customer_email" gorm:"not null"`
	CustomerPhone string `json:"customer_phone" gorm:"not null"`

	BillingAddress struct {
		Street     string `json:"street" gorm:"not null"`
		Number     string `json:"number" gorm:"not null"`
		Complement string `json:"complement"`
		District   string `json:"district" gorm:"not null"`
		City       string `json:"city" gorm:"not null"`
		State      string `json:"state" gorm:"not null"`
		ZipCode    string `json:"zip_code" gorm:"not null"`
	} `json:"billing_address" gorm:"embedded;embeddedPrefix:billing_"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Member    *Member    `json:"member,omitempty" gorm:"foreignKey:MemberID"`
	Campaign  *Campaign  `json:"campaign,omitempty" gorm:"foreignKey:CampaignID"`
}

// BeforeCreate hook para gerar UUIDs antes de criar os registros
func (c *Campaign) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

func (d *Donation) BeforeCreate(tx *gorm.DB) error {
	if d.ID == "" {
		d.ID = uuid.New().String()
	}
	return nil
}

func (r *RecurringDonation) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

func (a *AsaasConfig) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}
