package repository

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repositories struct {
	User      UserRepository
	Community CommunityRepository
	Member    MemberRepository
	Group     GroupRepository
	Event     EventRepository
	Family    FamilyRepository
}

func NewRepositories(db *gorm.DB, logger *zap.Logger) *Repositories {
	return &Repositories{
		User:      NewUserRepository(db, logger),
		Community: NewCommunityRepository(db, logger),
		Member:    NewMemberRepository(db, logger),
		Group:     NewGroupRepository(db, logger),
		Event:     NewEventRepository(db, logger),
		Family:    NewFamilyRepository(db, logger),
	}
}
