package domain

import "time"

type Community struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid"`
	Name        string    `json:"name" gorm:"not null"`
	Slug        string    `json:"slug" gorm:"uniqueIndex;not null"`
	Description string    `json:"description" gorm:"not null"`
	Logo        string    `json:"logo" gorm:"type:varchar(255)"`
	Banner      string    `json:"banner" gorm:"type:varchar(255)"`
	Website     string    `json:"website" gorm:"type:varchar(255)"`
	Email       string    `json:"email" gorm:"type:varchar(255)"`
	Phone       string    `json:"phone" gorm:"type:varchar(20)"`
	Address     string    `json:"address" gorm:"type:text"`
	City        string    `json:"city" gorm:"type:varchar(100)"`
	State       string    `json:"state" gorm:"type:varchar(100)"`
	Country     string    `json:"country" gorm:"type:varchar(100)"`
	ZipCode     string    `json:"zip_code" gorm:"type:varchar(20)"`
	Timezone    string    `json:"timezone" gorm:"type:varchar(50);default:'America/Sao_Paulo'"`
	Language    string    `json:"language" gorm:"type:varchar(10);default:'pt-BR'"`
	Status      string    `json:"status" gorm:"not null;default:active;check:status IN ('active', 'inactive', 'archived')"`
	Type        string    `json:"type" gorm:"not null;default:church;check:type IN ('church', 'ministry', 'organization', 'other')"`
	CreatedBy   string    `json:"created_by" gorm:"type:uuid;not null"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"not null"`

	// Configurações
	AllowPublicEvents       bool `json:"allow_public_events" gorm:"default:true"`
	AllowPublicGroups       bool `json:"allow_public_groups" gorm:"default:true"`
	AllowMemberRegistration bool `json:"allow_member_registration" gorm:"default:true"`
	RequireApproval         bool `json:"require_approval" gorm:"default:true"`
	AllowGuestAttendance    bool `json:"allow_guest_attendance" gorm:"default:true"`
	EnableContributions     bool `json:"enable_contributions" gorm:"default:true"`
	EnableEvents            bool `json:"enable_events" gorm:"default:true"`
	EnableGroups            bool `json:"enable_groups" gorm:"default:true"`
	EnableAttendance        bool `json:"enable_attendance" gorm:"default:true"`

	// Estatísticas
	MemberCount     int `json:"member_count" gorm:"default:0"`
	EventCount      int `json:"event_count" gorm:"default:0"`
	GroupCount      int `json:"group_count" gorm:"default:0"`
	AttendanceCount int `json:"attendance_count" gorm:"default:0"`

	// Relacionamentos
	Creator *User     `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	Members []*Member `json:"members,omitempty" gorm:"foreignKey:CommunityID"`
	Groups  []*Group  `json:"groups,omitempty" gorm:"foreignKey:CommunityID"`
	Events  []*Event  `json:"events,omitempty" gorm:"foreignKey:CommunityID"`
}

func (c *Community) IsActive() bool {
	return c.Status == "active"
}

func (c *Community) IsInactive() bool {
	return c.Status == "inactive"
}

func (c *Community) IsArchived() bool {
	return c.Status == "archived"
}

func (c *Community) IsChurch() bool {
	return c.Type == "church"
}

func (c *Community) IsMinistry() bool {
	return c.Type == "ministry"
}

func (c *Community) IsOrganization() bool {
	return c.Type == "organization"
}

func (c *Community) AllowsPublicEvents() bool {
	return c.AllowPublicEvents && c.EnableEvents
}

func (c *Community) AllowsPublicGroups() bool {
	return c.AllowPublicGroups && c.EnableGroups
}

func (c *Community) AllowsGuestAttendance() bool {
	return c.AllowGuestAttendance && c.EnableAttendance
}

func (c *Community) RequiresApproval() bool {
	return c.RequireApproval
}

func (c *Community) HasContributionsEnabled() bool {
	return c.EnableContributions
}

func (c *Community) HasEventsEnabled() bool {
	return c.EnableEvents
}

func (c *Community) HasGroupsEnabled() bool {
	return c.EnableGroups
}

func (c *Community) HasAttendanceEnabled() bool {
	return c.EnableAttendance
}
