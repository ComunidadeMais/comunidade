package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Member struct {
	ID               string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID      string    `json:"community_id" gorm:"type:uuid;not null"`
	UserID           string    `json:"user_id" gorm:"type:uuid"`
	Photo            string    `json:"photo" gorm:"type:varchar(255)"`
	Name             string    `json:"name" gorm:"not null"`
	Email            string    `json:"email" gorm:"not null"`
	Phone            string    `json:"phone" gorm:"type:varchar(20)"`
	Role             string    `json:"role" gorm:"not null;default:member;check:role IN ('member', 'leader', 'admin')"`
	Status           string    `json:"status" gorm:"not null;default:pending;check:status IN ('pending', 'active', 'inactive', 'blocked')"`
	Type             string    `json:"type" gorm:"not null;default:regular;check:type IN ('regular', 'visitor', 'transferred')"`
	JoinDate         time.Time `json:"join_date" gorm:"not null"`
	BirthDate        time.Time `json:"birth_date" gorm:"type:date"`
	Gender           string    `json:"gender" gorm:"type:varchar(20)"`
	MaritalStatus    string    `json:"marital_status" gorm:"type:varchar(20)"`
	Occupation       string    `json:"occupation" gorm:"type:varchar(100)"`
	Address          string    `json:"address" gorm:"type:text"`
	City             string    `json:"city" gorm:"type:varchar(100)"`
	State            string    `json:"state" gorm:"type:varchar(100)"`
	Country          string    `json:"country" gorm:"type:varchar(100)"`
	ZipCode          string    `json:"zip_code" gorm:"type:varchar(20)"`
	Notes            string    `json:"notes" gorm:"type:text"`
	EmergencyContact string    `json:"emergency_contact" gorm:"type:varchar(100)"`
	EmergencyPhone   string    `json:"emergency_phone" gorm:"type:varchar(20)"`
	CreatedAt        time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt        time.Time `json:"updated_at" gorm:"not null"`

	// Campos de participação
	LastAttendanceAt   *time.Time `json:"last_attendance_at"`
	AttendanceCount    int        `json:"attendance_count" gorm:"default:0"`
	LastContributionAt *time.Time `json:"last_contribution_at"`
	ContributionCount  int        `json:"contribution_count" gorm:"default:0"`
	TotalContributions float64    `json:"total_contributions" gorm:"type:decimal(10,2);default:0"`

	// Campos de ministério
	Ministry          string     `json:"ministry" gorm:"type:varchar(100)"`
	MinistryRole      string     `json:"ministry_role" gorm:"type:varchar(100)"`
	MinistryStartDate *time.Time `json:"ministry_start_date"`
	IsVolunteer       bool       `json:"is_volunteer" gorm:"default:false"`
	Skills            []string   `json:"skills" gorm:"type:text[]"`
	Interests         []string   `json:"interests" gorm:"type:text[]"`

	// Campos de família
	//FamilyID   string `json:"family_id" gorm:"type:uuid"`
	FamilyRole string `json:"family_role" gorm:"type:varchar(50)"`
	//SpouseID   string `json:"spouse_id" gorm:"type:uuid"`
	//ParentID   string `json:"parent_id" gorm:"type:uuid"`

	FamilyID *string `json:"family_id" gorm:"type:uuid"`
	SpouseID *string `json:"spouse_id" gorm:"type:uuid"`
	ParentID *string `json:"parent_id" gorm:"type:uuid"`

	// Campos de batismo e membresia
	BaptismDate     *time.Time `json:"baptism_date"`
	BaptismLocation string     `json:"baptism_location" gorm:"type:varchar(255)"`
	MembershipDate  *time.Time `json:"membership_date"`
	MembershipType  string     `json:"membership_type" gorm:"type:varchar(50)"`
	PreviousChurch  string     `json:"previous_church" gorm:"type:varchar(255)"`
	TransferredFrom string     `json:"transferred_from" gorm:"type:varchar(255)"`
	TransferredTo   string     `json:"transferred_to" gorm:"type:varchar(255)"`
	TransferDate    *time.Time `json:"transfer_date"`

	// Campos de comunicação
	NotifyByEmail            bool `json:"notify_by_email" gorm:"default:true"`
	NotifyByPhone            bool `json:"notify_by_phone" gorm:"default:false"`
	NotifyByWhatsApp         bool `json:"notify_by_whatsapp" gorm:"default:false"`
	AllowPhotos              bool `json:"allow_photos" gorm:"default:true"`
	IsSubscribedToNewsletter bool `json:"is_subscribed_to_newsletter" gorm:"default:true"`

	// Relacionamentos
	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	User      *User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Groups    []*Group   `json:"groups,omitempty" gorm:"many2many:group_members;"`
	Events    []*Event   `json:"events,omitempty" gorm:"many2many:event_attendances;"`
	Family    []*Member  `json:"family,omitempty" gorm:"foreignKey:FamilyID"`
	Spouse    *Member    `json:"spouse,omitempty" gorm:"foreignKey:SpouseID"`
	Parent    *Member    `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children  []*Member  `json:"children,omitempty" gorm:"foreignKey:ParentID"`
}

// BeforeCreate é chamado antes de criar um novo membro
func (m *Member) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}

// IsActive verifica se o membro está ativo
func (m *Member) IsActive() bool {
	return m.Status == "active"
}

func (m *Member) IsPending() bool {
	return m.Status == "pending"
}

func (m *Member) IsBlocked() bool {
	return m.Status == "blocked"
}

func (m *Member) IsAdmin() bool {
	return m.Role == "admin"
}

func (m *Member) IsLeader() bool {
	return m.Role == "leader"
}

func (m *Member) IsRegularMember() bool {
	return m.Type == "regular"
}

func (m *Member) IsVisitor() bool {
	return m.Type == "visitor"
}

func (m *Member) IsTransferred() bool {
	return m.Type == "transferred"
}

func (m *Member) HasFamily() bool {
	return m.FamilyID != nil
}

func (m *Member) HasSpouse() bool {
	return m.SpouseID != nil
}

func (m *Member) HasParent() bool {
	return m.ParentID != nil
}

func (m *Member) IsBaptized() bool {
	return m.BaptismDate != nil
}

func (m *Member) HasMinistry() bool {
	return m.Ministry != ""
}

func (m *Member) IsVolunteerActive() bool {
	return m.IsVolunteer && m.Status == "active"
}

func (m *Member) HasAttendedEvents() bool {
	return m.AttendanceCount > 0
}

func (m *Member) HasContributed() bool {
	return m.ContributionCount > 0
}

func (m *Member) Age() int {
	if m.BirthDate.IsZero() {
		return 0
	}

	now := time.Now()
	age := now.Year() - m.BirthDate.Year()

	// Ajusta a idade se ainda não fez aniversário este ano
	if now.YearDay() < m.BirthDate.YearDay() {
		age--
	}

	return age
}
