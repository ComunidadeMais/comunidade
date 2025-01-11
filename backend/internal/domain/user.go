package domain

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID               string         `json:"id" gorm:"primaryKey;type:uuid"`
	Name             string         `json:"name" gorm:"not null"`
	Email            string         `json:"email" gorm:"uniqueIndex;not null"`
	Password         string         `json:"-" gorm:"not null"`
	Role             string         `json:"role" gorm:"not null;default:user;check:role IN ('user', 'admin', 'super_admin')"`
	Status           string         `json:"status" gorm:"not null;default:active;check:status IN ('active', 'inactive', 'blocked')"`
	Phone            string         `json:"phone" gorm:"type:varchar(20)"`
	Avatar           string         `json:"avatar" gorm:"type:varchar(255)"`
	Bio              string         `json:"bio" gorm:"type:text"`
	DateOfBirth      *time.Time     `json:"date_of_birth" gorm:"type:date"`
	Gender           string         `json:"gender" gorm:"type:varchar(20)"`
	Address          string         `json:"address" gorm:"type:text"`
	City             string         `json:"city" gorm:"type:varchar(100)"`
	State            string         `json:"state" gorm:"type:varchar(100)"`
	Country          string         `json:"country" gorm:"type:varchar(100)"`
	ZipCode          string         `json:"zip_code" gorm:"type:varchar(20)"`
	LastLoginAt      *time.Time     `json:"last_login_at"`
	EmailVerifiedAt  *time.Time     `json:"email_verified_at"`
	PhoneVerifiedAt  *time.Time     `json:"phone_verified_at"`
	ResetToken       *string        `json:"-" gorm:"type:uuid"`
	ResetTokenExpiry *time.Time     `json:"-"`
	CreatedAt        time.Time      `json:"created_at" gorm:"not null"`
	UpdatedAt        time.Time      `json:"updated_at" gorm:"not null"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	// Campos de preferências
	Language      string `json:"language" gorm:"type:varchar(10);default:'pt-BR'"`
	Theme         string `json:"theme" gorm:"type:varchar(20);default:'light'"`
	Timezone      string `json:"timezone" gorm:"type:varchar(50);default:'America/Sao_Paulo'"`
	NotifyByEmail bool   `json:"notify_by_email" gorm:"default:true"`
	NotifyByPhone bool   `json:"notify_by_phone" gorm:"default:false"`

	// Campos de segurança
	TwoFactorEnabled    bool       `json:"two_factor_enabled" gorm:"default:false"`
	TwoFactorSecret     string     `json:"-" gorm:"type:varchar(255)"`
	LastPasswordChange  time.Time  `json:"last_password_change" gorm:"not null;default:CURRENT_TIMESTAMP"`
	FailedLoginAttempts int        `json:"-" gorm:"default:0"`
	LastFailedLoginAt   *time.Time `json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		tx.Statement.SetColumn("ID", tx.Statement.Context.Value("uuid").(string))
	}
	return nil
}

func (u *User) HashPassword() error {
	if u.Password == "" {
		return nil
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

func (u *User) IsSuperAdmin() bool {
	return u.Role == "super_admin"
}

func (u *User) IsActive() bool {
	return u.Status == "active"
}

func (u *User) IsBlocked() bool {
	return u.Status == "blocked"
}

func (u *User) IsEmailVerified() bool {
	return u.EmailVerifiedAt != nil
}

func (u *User) IsPhoneVerified() bool {
	return u.PhoneVerifiedAt != nil
}

func (u *User) HasTwoFactorEnabled() bool {
	return u.TwoFactorEnabled
}

func (u *User) IncrementFailedLoginAttempts() {
	u.FailedLoginAttempts++
	u.LastFailedLoginAt = &time.Time{}
}

func (u *User) ResetFailedLoginAttempts() {
	u.FailedLoginAttempts = 0
	u.LastFailedLoginAt = nil
}

func (u *User) ShouldBlockAccount() bool {
	return u.FailedLoginAttempts >= 5
}
