package database

import (
	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB, logger *zap.Logger) error {
	logger.Info("executando migrações do banco de dados")

	// Lista de modelos para migração
	models := []interface{}{
		&domain.User{},
		&domain.Community{},
		&domain.Member{},
		&domain.Group{},
		&domain.Event{},
		&domain.Attendance{},
		&domain.Family{},
		&domain.FamilyMember{},
		&domain.Communication{},
		&domain.CommunicationRecipient{},
		&domain.CommunicationTemplate{},
		&domain.CommunicationSettings{},
		&domain.CheckIn{},
		&domain.Expense{},
		&domain.Revenue{},
		&domain.Supplier{},
		&domain.FinancialCategory{},
		&domain.FinancialReport{},
	}

	// Executa as migrações
	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			logger.Error("erro ao executar migração",
				zap.String("model", db.Model(model).Name()),
				zap.Error(err),
			)
			return err
		}
	}

	logger.Info("migrações concluídas com sucesso")
	return nil
}
