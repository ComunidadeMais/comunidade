package domain

import (
	"time"
)

type Family struct {
	ID           string    `json:"id" gorm:"primaryKey;type:uuid" db:"id"`
	CommunityID  string    `json:"community_id" gorm:"type:uuid;not null" db:"community_id"`
	Name         string    `json:"name" gorm:"not null" db:"name"`                      // Nome da família (ex: "Família Silva")
	Description  string    `json:"description" gorm:"type:text" db:"description"`       // Descrição ou notas sobre a família
	HeadOfFamily string    `json:"head_of_family" gorm:"type:uuid" db:"head_of_family"` // ID do membro que é o chefe da família
	CreatedAt    time.Time `json:"created_at" gorm:"not null" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"not null" db:"updated_at"`
}

type FamilyMember struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid" db:"id"`
	FamilyID  string    `json:"family_id" gorm:"type:uuid;not null" db:"family_id"`
	MemberID  string    `json:"member_id" gorm:"type:uuid;not null" db:"member_id"`
	Role      string    `json:"role" gorm:"not null" db:"role"` // esposo, esposa, filho(a), irmão(ã), etc
	CreatedAt time.Time `json:"created_at" gorm:"not null" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"not null" db:"updated_at"`
}

// Roles possíveis para membros da família
const (
	FamilyRoleSpouse      = "spouse"       // Cônjuge
	FamilyRoleChild       = "child"        // Filho(a)
	FamilyRoleSibling     = "sibling"      // Irmão(ã)
	FamilyRoleParent      = "parent"       // Pai/Mãe
	FamilyRoleGrandparent = "grandparent"  // Avô/Avó
	FamilyRoleGrandchild  = "grandchild"   // Neto(a)
	FamilyRoleUncleAunt   = "uncle_aunt"   // Tio(a)
	FamilyRoleNephewNiece = "nephew_niece" // Sobrinho(a)
	FamilyRoleCousin      = "cousin"       // Primo(a)
	FamilyRoleOther       = "other"        // Outro
)
