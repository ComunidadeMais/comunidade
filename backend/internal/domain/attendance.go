package domain

import "time"

type Attendance struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid"`
	EventID   string    `json:"event_id" gorm:"type:uuid;not null"`
	MemberID  string    `json:"member_id" gorm:"type:uuid;not null"`
	Status    string    `json:"status" gorm:"not null;check:status IN ('present', 'absent', 'late')"`
	CreatedAt time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"not null"`

	// Relacionamentos
	Event  *Event  `json:"event,omitempty" gorm:"foreignKey:EventID"`
	Member *Member `json:"member,omitempty" gorm:"foreignKey:MemberID"`
}

func (a *Attendance) IsPresent() bool {
	return a.Status == "present"
}

func (a *Attendance) IsAbsent() bool {
	return a.Status == "absent"
}

func (a *Attendance) IsLate() bool {
	return a.Status == "late"
}
