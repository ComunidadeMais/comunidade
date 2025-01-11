package domain

import "time"

type Event struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string    `json:"community_id" gorm:"type:uuid;not null"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description" gorm:"not null"`
	StartDate   time.Time `json:"start_date" gorm:"not null"`
	EndDate     time.Time `json:"end_date" gorm:"not null"`
	Location    string    `json:"location" gorm:"not null"`
	Type        string    `json:"type" gorm:"not null;check:type IN ('culto', 'service', 'class', 'meeting', 'visit', 'other')"`
	Recurrence  string    `json:"recurrence" gorm:"not null;default:'none';check:recurrence IN ('none', 'daily', 'weekly', 'monthly')"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"not null"`

	// Relacionamentos
	Community   *Community    `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	Attendances []*Attendance `json:"attendances,omitempty" gorm:"foreignKey:EventID"`
}

func (e *Event) IsService() bool {
	return e.Type == "service"
}

func (e *Event) IsClass() bool {
	return e.Type == "class"
}

func (e *Event) IsMeeting() bool {
	return e.Type == "meeting"
}

func (e *Event) HasRecurrence() bool {
	return e.Recurrence != "none"
}

func (e *Event) IsRecurringDaily() bool {
	return e.Recurrence == "daily"
}

func (e *Event) IsRecurringWeekly() bool {
	return e.Recurrence == "weekly"
}

func (e *Event) IsRecurringMonthly() bool {
	return e.Recurrence == "monthly"
}

func (e *Event) IsUpcoming() bool {
	return e.StartDate.After(time.Now())
}

func (e *Event) IsOngoing() bool {
	now := time.Now()
	return e.StartDate.Before(now) && e.EndDate.After(now)
}

func (e *Event) IsPast() bool {
	return e.EndDate.Before(time.Now())
}

func (e *Event) Duration() time.Duration {
	return e.EndDate.Sub(e.StartDate)
}
