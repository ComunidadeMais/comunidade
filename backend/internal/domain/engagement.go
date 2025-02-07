package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MemberAchievement representa uma conquista do membro
type MemberAchievement struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid"`
	MemberID    string    `json:"member_id" gorm:"type:uuid;not null"`
	BadgeName   string    `json:"badge_name" gorm:"type:varchar(50);not null"`
	Description string    `json:"description" gorm:"type:text"`
	Points      int       `json:"points" gorm:"not null;default:0"`
	EarnedAt    time.Time `json:"earned_at" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"not null"`

	Member *Member `json:"member,omitempty" gorm:"foreignKey:MemberID"`
}

// CommunityPost representa uma postagem no feed da comunidade
type CommunityPost struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string    `json:"community_id" gorm:"type:uuid;not null"`
	AuthorID    string    `json:"author_id" gorm:"type:uuid;not null"`
	Title       string    `json:"title" gorm:"type:varchar(255);not null"`
	Content     string    `json:"content" gorm:"type:text;not null"`
	Type        string    `json:"type" gorm:"type:varchar(50);not null;default:'post';check:type IN ('post', 'announcement', 'devotional')"`
	Likes       int       `json:"likes" gorm:"not null;default:0"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"not null"`

	Community *Community     `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	Author    *Member        `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	Comments  []*PostComment `json:"comments,omitempty" gorm:"foreignKey:PostID"`
}

// PostComment representa um comentário em uma postagem
type PostComment struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid"`
	PostID    string    `json:"post_id" gorm:"type:uuid;not null"`
	AuthorID  string    `json:"author_id" gorm:"type:uuid;not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	CreatedAt time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt time.Time `json:"updated_at" gorm:"not null"`

	Post   *CommunityPost `json:"post,omitempty" gorm:"foreignKey:PostID"`
	Author *Member        `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
}

// PostReaction representa uma reação a uma postagem
type PostReaction struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid"`
	PostID    string    `json:"post_id" gorm:"type:uuid;not null"`
	MemberID  string    `json:"member_id" gorm:"type:uuid;not null"`
	Type      string    `json:"type" gorm:"type:varchar(20);not null;check:type IN ('like', 'love', 'pray', 'celebrate')"`
	CreatedAt time.Time `json:"created_at" gorm:"not null"`

	Post   *CommunityPost `json:"post,omitempty" gorm:"foreignKey:PostID"`
	Member *Member        `json:"member,omitempty" gorm:"foreignKey:MemberID"`
}

// PrayerRequest representa um pedido de oração
type PrayerRequest struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid"`
	CommunityID string    `json:"community_id" gorm:"type:uuid;not null"`
	MemberID    string    `json:"member_id" gorm:"type:uuid;not null"`
	Title       string    `json:"title" gorm:"type:varchar(255);not null"`
	Content     string    `json:"content" gorm:"type:text;not null"`
	IsPrivate   bool      `json:"is_private" gorm:"not null;default:true"`
	Status      string    `json:"status" gorm:"type:varchar(20);not null;default:'pending';check:status IN ('pending', 'praying', 'answered')"`
	CreatedAt   time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"not null"`

	Community *Community `json:"community,omitempty" gorm:"foreignKey:CommunityID"`
	Member    *Member    `json:"member,omitempty" gorm:"foreignKey:MemberID"`
}

// BeforeCreate hooks para gerar UUIDs
func (m *MemberAchievement) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}

func (p *CommunityPost) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

func (c *PostComment) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

func (r *PostReaction) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

func (p *PrayerRequest) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}
