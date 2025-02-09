package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Storage  StorageConfig
	Email    EmailConfig
}

type ServerConfig struct {
	Port    int
	Timeout int
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
	Timezone string
}

type JWTConfig struct {
	Secret            string
	Expiration        string
	RefreshExpiration string
}

type StorageConfig struct {
	UploadsDir string
}

type EmailConfig struct {
	SMTPHost     string
	SMTPPort     int
	SMTPUser     string
	SMTPPassword string
	FromName     string
	FromEmail    string
}

func Load() (*Config, error) {
	// Tenta carregar o arquivo .env, mas não retorna erro se não existir
	godotenv.Load()

	return &Config{
		Server: ServerConfig{
			Port:    getEnvAsInt("PORT", 8080),
			Timeout: getEnvAsInt("SERVER_TIMEOUT", 30),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DATABASE_HOST", "localhost"),
			Port:     getEnvAsInt("DATABASE_PORT", 5432),
			User:     getEnv("DATABASE_USER", "postgres"),
			Password: getEnv("DATABASE_PASSWORD", "postgres"),
			Name:     getEnv("DATABASE_NAME", "comunidade"),
			SSLMode:  getEnv("DATABASE_SSLMODE", "disable"),
			Timezone: getEnv("DATABASE_TIMEZONE", "UTC"),
		},
		JWT: JWTConfig{
			Secret:            getEnv("JWT_SECRET", "your-secret-key"),
			Expiration:        getEnv("JWT_EXPIRATION", "24h"),
			RefreshExpiration: getEnv("JWT_REFRESH_EXPIRATION", "168h"),
		},
		Storage: StorageConfig{
			UploadsDir: getEnv("UPLOADS_DIR", "/root/uploads"),
		},
		Email: EmailConfig{
			SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
			SMTPPort:     getEnvAsInt("SMTP_PORT", 587),
			SMTPUser:     getEnv("SMTP_USER", ""),
			SMTPPassword: getEnv("SMTP_PASSWORD", ""),
			FromName:     getEnv("FROM_NAME", "Comunidade"),
			FromEmail:    getEnv("FROM_EMAIL", ""),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
