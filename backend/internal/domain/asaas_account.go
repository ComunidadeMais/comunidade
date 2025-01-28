package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Status possíveis para informações comerciais
const (
	StatusRejected         = "REJECTED"          // Rejeitado
	StatusApproved         = "APPROVED"          // Aprovado
	StatusAwaitingApproval = "AWAITING_APPROVAL" // Aguardando aprovação
	StatusPending          = "PENDING"           // Pendente
)

// AsaasAccount representa uma subconta do ASAAS
type AsaasAccount struct {
	ID            string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID   string    `json:"community_id" gorm:"type:uuid;not null"`
	Name          string    `json:"name" gorm:"not null"`
	Email         string    `json:"email" gorm:"not null"`
	CPFCNPJ       string    `json:"cpf_cnpj" gorm:"not null"`
	CompanyType   string    `json:"company_type" gorm:"not null"`
	Phone         string    `json:"phone" gorm:"not null"`
	MobilePhone   string    `json:"mobile_phone" gorm:"not null"`
	Address       string    `json:"address" gorm:"not null"`
	AddressNumber string    `json:"address_number" gorm:"not null"`
	Complement    string    `json:"complement"`
	Province      string    `json:"province" gorm:"not null"`
	PostalCode    string    `json:"postal_code" gorm:"not null"`
	BirthDate     string    `json:"birth_date" gorm:"not null"`
	ApiKey        string    `json:"api_key"`
	WalletId      string    `json:"wallet_id"`
	Status        string    `json:"status" gorm:"not null;default:'pending'"`
	AsaasID       string    `json:"asaas_id"`
	CreatedAt     time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"not null"`

	// Dados bancários retornados pela API da ASAAS
	Bank            string `json:"bank" gorm:"column:bank_bank"`
	BankAgency      string `json:"bank_agency" gorm:"column:bank_bank_agency"`
	BankAccount     string `json:"bank_account" gorm:"column:bank_bank_account"`
	BankAccountType string `json:"bank_account_type" gorm:"column:bank_bank_account_type"`

	// Status do onboarding
	CommercialInfo  string `json:"commercial_info" gorm:"not null;default:'PENDING'"`   // PENDING, APPROVED, REJECTED, AWAITING_APPROVAL
	BankAccountInfo string `json:"bank_account_info" gorm:"not null;default:'PENDING'"` // PENDING, APPROVED, REJECTED
	Documentation   string `json:"documentation" gorm:"not null;default:'PENDING'"`     // PENDING, APPROVED, REJECTED, AWAITING_APPROVAL
	GeneralStatus   string `json:"general_status" gorm:"not null;default:'PENDING'"`    // PENDING, APPROVED, REJECTED, AWAITING_APPROVAL
	OnboardingUrl   string `json:"onboarding_url"`                                      // URL para envio de documentos
	PersonType      string `json:"person_type" gorm:"not null;default:'JURIDICA'"`      // JURIDICA, FISICA

	// Webhooks
	Webhooks []WebhookConfig `json:"webhooks" gorm:"type:jsonb"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
}

type WebhookConfig struct {
	Name        string   `json:"name"`
	URL         string   `json:"url"`
	Email       string   `json:"email"`
	SendType    string   `json:"send_type" gorm:"default:'SEQUENTIALLY'"` // SEQUENTIALLY
	Interrupted bool     `json:"interrupted" gorm:"default:false"`
	Enabled     bool     `json:"enabled" gorm:"default:true"`
	APIVersion  int      `json:"api_version" gorm:"default:3"`
	AuthToken   string   `json:"auth_token"`
	Events      []string `json:"events" gorm:"type:text[]"`
}

// BeforeCreate - Hook para geração de ID
func (a *AsaasAccount) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}

// AccountStatus representa o status detalhado da conta
type AccountStatus struct {
	ID              string `json:"id"`
	CommercialInfo  string `json:"commercialInfo"`  // REJECTED, APPROVED, AWAITING_APPROVAL, PENDING
	BankAccountInfo string `json:"bankAccountInfo"` // PENDING, APPROVED, REJECTED
	Documentation   string `json:"documentation"`   // PENDING, APPROVED, REJECTED, AWAITING_APPROVAL
	General         string `json:"general"`         // PENDING, APPROVED, REJECTED, AWAITING_APPROVAL
}
