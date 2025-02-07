package postgres

import (
	"time"

	"github.com/lib/pq"
)

type Post struct {
	ID          string         `gorm:"primarykey;type:uuid;default:gen_random_uuid()"`
	CommunityID string         `gorm:"type:uuid;not null"`
	AuthorID    string         `gorm:"type:uuid;not null"`
	Title       string         `gorm:"type:varchar(255);not null"`
	Content     string         `gorm:"type:text;not null"`
	Type        string         `gorm:"type:varchar(50);not null;default:'post';check:type IN ('post', 'announcement', 'devotional')"`
	Likes       int            `gorm:"not null;default:0"`
	Images      pq.StringArray `gorm:"type:text[]"`
	CreatedAt   time.Time      `gorm:"not null"`
	UpdatedAt   time.Time      `gorm:"not null"`
}
