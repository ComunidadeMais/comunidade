package repository

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Registry struct {
	Community    CommunityRepository
	User         UserRepository
	Member       MemberRepository
	Group        GroupRepository
	Event        EventRepository
	Contribution ContributionRepository
}

func NewRegistry(db *gorm.DB, logger *zap.Logger) *Registry {
	return &Registry{
		Community:    NewCommunityRepository(db, logger),
		User:         NewUserRepository(db, logger),
		Member:       NewMemberRepository(db, logger),
		Group:        NewGroupRepository(db, logger),
		Event:        NewEventRepository(db, logger),
		Contribution: NewContributionRepository(db, logger),
	}
}
