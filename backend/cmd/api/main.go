package main

import (
	"context"
	"fmt"
	"log"

	"github.com/comunidade/backend/internal/config"
	"github.com/comunidade/backend/internal/database"
	"github.com/comunidade/backend/internal/delivery/http"
	"github.com/comunidade/backend/internal/repository"
	"go.uber.org/zap"
)

func main() {
	// Inicializa o logger
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Fatalf("erro ao criar logger: %v", err)
	}
	defer logger.Sync()

	// Carrega as configurações
	cfg, err := config.Load()
	if err != nil {
		logger.Error("erro ao carregar configurações",
			zap.Error(err),
			zap.String("dica", "verifique se o arquivo .env existe e está configurado corretamente"),
		)
		return
	}

	// Conecta ao banco de dados
	db, err := database.Connect(cfg.Database)
	if err != nil {
		logger.Error("erro ao conectar ao banco de dados",
			zap.Error(err),
			zap.Any("config", cfg.Database),
		)
		return
	}

	// Executa as migrações
	if err := database.RunMigrations(db, logger); err != nil {
		logger.Error("erro ao executar migrações", zap.Error(err))
		return
	}

	// Inicializa os repositórios
	repos := repository.NewRepositories(db, logger)

	// Inicializa o servidor HTTP
	server := http.NewServer(repos, logger)

	// Inicia o servidor
	logger.Info("servidor iniciado com sucesso",
		zap.Int("port", cfg.Server.Port),
		zap.String("database", cfg.Database.Name),
	)
	if err := server.Start(context.Background(), fmt.Sprintf(":%d", cfg.Server.Port)); err != nil {
		logger.Error("erro ao iniciar servidor", zap.Error(err))
	}
}
