package repository

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repositories struct {
	db            *gorm.DB
	User          UserRepository
	Community     CommunityRepository
	Member        MemberRepository
	Family        FamilyRepository
	Group         GroupRepository
	Event         EventRepository
	CheckIn       CheckInRepository
	Communication CommunicationRepository
}

func NewRepositories(db *gorm.DB, logger *zap.Logger) *Repositories {
	return &Repositories{
		db:            db,
		User:          NewUserRepository(db, logger),
		Community:     NewCommunityRepository(db, logger),
		Member:        NewMemberRepository(db, logger),
		Family:        NewFamilyRepository(db, logger),
		Group:         NewGroupRepository(db, logger),
		Event:         NewEventRepository(db, logger),
		CheckIn:       NewCheckInRepository(db, logger),
		Communication: NewCommunicationRepository(db, logger),
	}
}
