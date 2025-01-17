package domain

import (
	"time"
)

type CheckIn struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	EventID   string    `json:"event_id" binding:"required,uuid"`
	MemberID  *string   `json:"member_id" binding:"omitempty,uuid"`
	IsVisitor bool      `json:"is_visitor"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	City      string    `json:"city,omitempty"`
	District  string    `json:"district,omitempty"`
	Source    string    `json:"source,omitempty"`
	Consent   bool      `json:"consent"`
	CheckInAt time.Time `json:"check_in_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CheckInStats struct {
	TotalCheckIns    int64 `json:"total_check_ins"`
	MembersCheckIns  int64 `json:"members_check_ins"`
	VisitorsCheckIns int64 `json:"visitors_check_ins"`
}

type CheckInRequest struct {
	EventID   string   `json:"event_id" binding:"required,uuid"`
	MemberID  *string  `json:"member_id" binding:"omitempty,uuid"`
	IsVisitor bool     `json:"is_visitor"`
	Name      string   `json:"name" binding:"required"`
	Email     string   `json:"email" binding:"required,email"`
	Phone     string   `json:"phone" binding:"required"`
	City      string   `json:"city"`
	District  string   `json:"district"`
	Source    string   `json:"source"`
	Consent   bool     `json:"consent" binding:"required"`
	FamilyIds []string `json:"family_ids,omitempty" binding:"omitempty,dive,uuid"`
}
