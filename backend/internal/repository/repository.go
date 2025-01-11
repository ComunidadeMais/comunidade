package repository

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository interface {
	GetDB() *gorm.DB
	GetLogger() *zap.Logger
}

type BaseRepository struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewBaseRepository(db *gorm.DB, logger *zap.Logger) BaseRepository {
	return BaseRepository{db: db, logger: logger}
}

func (r BaseRepository) GetDB() *gorm.DB {
	return r.db
}

func (r BaseRepository) GetLogger() *zap.Logger {
	return r.logger
}
