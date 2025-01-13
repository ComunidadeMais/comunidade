package domain

import "time"

type CommunicationType string

const (
	CommunicationTypeEmail    CommunicationType = "email"
	CommunicationTypeSMS      CommunicationType = "sms"
	CommunicationTypeWhatsApp CommunicationType = "whatsapp"
)

type CommunicationStatus string

const (
	CommunicationStatusPending   CommunicationStatus = "pending"
	CommunicationStatusSent      CommunicationStatus = "sent"
	CommunicationStatusDelivered CommunicationStatus = "delivered"
	CommunicationStatusFailed    CommunicationStatus = "failed"
)

type RecipientType string

const (
	RecipientTypeMember RecipientType = "member"
	RecipientTypeGroup  RecipientType = "group"
	RecipientTypeFamily RecipientType = "family"
	RecipientTypeCustom RecipientType = "custom"
)

// Comunicação
type Communication struct {
	ID            string              `json:"id" gorm:"primaryKey"`
	CommunityID   string              `json:"community_id" gorm:"not null"`
	Type          CommunicationType   `json:"type" gorm:"not null"`
	Status        CommunicationStatus `json:"status" gorm:"not null"`
	Subject       string              `json:"subject" gorm:"not null"`
	Content       string              `json:"content" gorm:"type:text;not null"`
	RecipientType RecipientType       `json:"recipient_type" gorm:"not null"`
	RecipientID   string              `json:"recipient_id" gorm:"not null"`
	SentAt        *time.Time          `json:"sent_at"`
	DeliveredAt   *time.Time          `json:"delivered_at"`
	CreatedBy     string              `json:"created_by" gorm:"not null"`
	CreatedAt     time.Time           `json:"created_at"`
	UpdatedAt     time.Time           `json:"updated_at"`
}

// Destinatário da comunicação
type CommunicationRecipient struct {
	ID              string              `json:"id" gorm:"primaryKey"`
	CommunicationID string              `json:"communication_id" gorm:"not null"`
	RecipientType   RecipientType       `json:"recipient_type" gorm:"not null"`
	RecipientID     string              `json:"recipient_id" gorm:"not null"`
	Email           *string             `json:"email"`
	Phone           *string             `json:"phone"`
	Status          CommunicationStatus `json:"status" gorm:"not null"`
	SentAt          *time.Time          `json:"sent_at"`
	DeliveredAt     *time.Time          `json:"delivered_at"`
	ErrorMessage    *string             `json:"error_message"`
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
}

// Template de comunicação
type CommunicationTemplate struct {
	ID          string            `json:"id" gorm:"primaryKey"`
	CommunityID string            `json:"community_id" gorm:"not null"`
	Name        string            `json:"name" gorm:"not null"`
	Type        CommunicationType `json:"type" gorm:"not null"`
	Subject     string            `json:"subject"`
	Content     string            `json:"content" gorm:"type:text;not null"`
	Variables   []string          `json:"variables" gorm:"type:json"`
	CreatedBy   string            `json:"created_by" gorm:"not null"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

// Configurações de comunicação da comunidade
type CommunicationSettings struct {
	ID               string    `json:"id" gorm:"primaryKey"`
	CommunityID      string    `json:"community_id" gorm:"not null;unique"`
	EmailEnabled     bool      `json:"email_enabled" gorm:"default:false"`
	EmailSMTPHost    string    `json:"email_smtp_host"`
	EmailSMTPPort    int       `json:"email_smtp_port"`
	EmailUsername    string    `json:"email_username"`
	EmailPassword    string    `json:"email_password"`
	EmailFromName    string    `json:"email_from_name"`
	EmailFromAddress string    `json:"email_from_address"`
	SMSEnabled       bool      `json:"sms_enabled" gorm:"default:false"`
	SMSProvider      string    `json:"sms_provider"`
	SMSApiKey        string    `json:"sms_api_key"`
	WhatsAppEnabled  bool      `json:"whatsapp_enabled" gorm:"default:false"`
	WhatsAppProvider string    `json:"whatsapp_provider"`
	WhatsAppApiKey   string    `json:"whatsapp_api_key"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
