package domain

import "time"

type Group struct {
	ID          string     `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string     `json:"community_id" gorm:"type:uuid;not null"`
	Name        string     `json:"name" gorm:"not null"`
	Description string     `json:"description" gorm:"not null"`
	Type        string     `json:"type" gorm:"not null;default:small_group;check:type IN ('cell', 'small_group', 'ministry', 'department', 'committee', 'other')"`
	Category    string     `json:"category" gorm:"type:varchar(100)"`
	Status      string     `json:"status" gorm:"not null;default:active;check:status IN ('active', 'inactive', 'archived')"`
	Visibility  string     `json:"visibility" gorm:"not null;default:public;check:visibility IN ('public', 'private', 'hidden')"`
	LeaderID    *string    `json:"leader_id" gorm:"type:uuid;null"`
	CoLeaderID  *string    `json:"co_leader_id" gorm:"type:uuid;null"`
	Location    string     `json:"location" gorm:"type:text"`
	MeetingDay  string     `json:"meeting_day" gorm:"type:varchar(20)"`
	MeetingTime string     `json:"meeting_time" gorm:"type:varchar(20)"`
	Frequency   string     `json:"frequency" gorm:"type:varchar(50);default:'weekly'"`
	MaxMembers  int        `json:"max_members" gorm:"default:0"`
	MinAge      int        `json:"min_age" gorm:"default:0"`
	MaxAge      int        `json:"max_age" gorm:"default:0"`
	Gender      string     `json:"gender" gorm:"type:varchar(20)"`
	Tags        []string   `json:"tags" gorm:"type:text[]"`
	StartDate   time.Time  `json:"start_date" gorm:"not null"`
	EndDate     *time.Time `json:"end_date"`
	CreatedAt   time.Time  `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"not null"`

	// Campos de configuração
	AllowGuests         bool `json:"allow_guests" gorm:"default:true"`
	RequireApproval     bool `json:"require_approval" gorm:"default:false"`
	TrackAttendance     bool `json:"track_attendance" gorm:"default:true"`
	AllowSelfJoin       bool `json:"allow_self_join" gorm:"default:true"`
	NotifyOnJoinRequest bool `json:"notify_on_join_request" gorm:"default:true"`
	NotifyOnNewMember   bool `json:"notify_on_new_member" gorm:"default:true"`

	// Estatísticas
	MemberCount       int     `json:"member_count" gorm:"default:0"`
	AttendanceCount   int     `json:"attendance_count" gorm:"default:0"`
	AverageAttendance float64 `json:"average_attendance" gorm:"type:decimal(5,2);default:0"`
	MeetingCount      int     `json:"meeting_count" gorm:"default:0"`

	// Relacionamentos
	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	Leader    *Member    `json:"leader,omitempty" gorm:"foreignKey:LeaderID"`
	CoLeader  *Member    `json:"co_leader,omitempty" gorm:"foreignKey:CoLeaderID"`
	Members   []*Member  `json:"members,omitempty" gorm:"many2many:group_members;"`
}

func (g *Group) IsActive() bool {
	return g.Status == "active"
}

func (g *Group) IsInactive() bool {
	return g.Status == "inactive"
}

func (g *Group) IsArchived() bool {
	return g.Status == "archived"
}

func (g *Group) IsPublic() bool {
	return g.Visibility == "public"
}

func (g *Group) IsPrivate() bool {
	return g.Visibility == "private"
}

func (g *Group) IsHidden() bool {
	return g.Visibility == "hidden"
}

func (g *Group) IsSmallGroup() bool {
	return g.Type == "small_group"
}

func (g *Group) IsMinistry() bool {
	return g.Type == "ministry"
}

func (g *Group) IsDepartment() bool {
	return g.Type == "department"
}

func (g *Group) IsCommittee() bool {
	return g.Type == "committee"
}

func (g *Group) HasSpace() bool {
	if g.MaxMembers == 0 {
		return true
	}
	return g.MemberCount < g.MaxMembers
}

func (g *Group) HasEnded() bool {
	return g.EndDate != nil && g.EndDate.Before(time.Now())
}

func (g *Group) HasStarted() bool {
	return g.StartDate.Before(time.Now())
}

func (g *Group) IsOngoing() bool {
	return g.HasStarted() && !g.HasEnded()
}

func (g *Group) RequiresApproval() bool {
	return g.RequireApproval
}

func (g *Group) AllowsSelfJoin() bool {
	return g.AllowSelfJoin && g.IsActive() && !g.HasEnded()
}

func (g *Group) TracksAttendance() bool {
	return g.TrackAttendance
}

func (g *Group) HasLeader() bool {
	return g.LeaderID != nil
}

func (g *Group) HasCoLeader() bool {
	return g.CoLeaderID != nil
}

func (g *Group) HasMembers() bool {
	return g.MemberCount > 0
}

func (g *Group) HasAgeRestriction() bool {
	return g.MinAge > 0 || g.MaxAge > 0
}

func (g *Group) HasGenderRestriction() bool {
	return g.Gender != ""
}
