package database

import (
	"fmt"
	"time"

	"github.com/comunidade/backend/pkg/config"
	"github.com/comunidade/backend/pkg/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

// Init inicializa a conexão com o banco de dados
func Init(cfg *config.Config) (*gorm.DB, error) {
	var err error

	gormConfig := &gorm.Config{}

	db, err = gorm.Open(postgres.Open(cfg.GetDSN()), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("erro ao conectar ao banco de dados: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("erro ao obter conexão SQL: %v", err)
	}

	// Configura o pool de conexões
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	logger.Info("conexão com o banco de dados estabelecida")

	return db, nil
}

// GetDB retorna a conexão com o banco de dados
func GetDB() *gorm.DB {
	return db
}

// Close fecha a conexão com o banco de dados
func Close() error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("erro ao obter conexão SQL: %v", err)
	}

	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("erro ao fechar conexão com o banco de dados: %v", err)
	}

	logger.Info("conexão com o banco de dados fechada")

	return nil
}
