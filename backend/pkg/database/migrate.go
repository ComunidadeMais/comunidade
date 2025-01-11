package database

import (
	"log"

	"github.com/comunidade/backend/internal/domain"
)

func AutoMigrate() {
	log.Println("Running database migrations...")

	err := db.AutoMigrate(
		&domain.Community{},
		&domain.User{},
		&domain.Member{},
		&domain.Group{},
		&domain.Event{},
		&domain.Attendance{},
		&domain.Contribution{},
		&domain.ContributionBatch{},
	)

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migrations completed successfully")
}
