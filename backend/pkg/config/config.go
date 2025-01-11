package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config representa a configuração da aplicação
type Config struct {
	AppName     string
	Environment string
	Port        int
	BaseURL     string

	// Database
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// Redis
	RedisHost     string
	RedisPort     int
	RedisPassword string
	RedisDB       int

	// JWT
	JWTSecret        string
	JWTExpiration    time.Duration
	JWTRefreshToken  string
	JWTRefreshExpiry time.Duration

	// SMTP
	SMTPHost     string
	SMTPPort     int
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string

	// Storage
	StorageDriver string
	StoragePath   string
	StorageURL    string
}

// Load carrega as configurações do arquivo .env
func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		return nil, fmt.Errorf("erro ao carregar arquivo .env: %v", err)
	}

	port, _ := strconv.Atoi(getEnv("PORT", "8080"))
	dbPort, _ := strconv.Atoi(getEnv("DB_PORT", "5432"))
	redisPort, _ := strconv.Atoi(getEnv("REDIS_PORT", "6379"))
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))
	jwtExpiration, _ := time.ParseDuration(getEnv("JWT_EXPIRATION", "24h"))
	jwtRefreshExpiry, _ := time.ParseDuration(getEnv("JWT_REFRESH_EXPIRY", "168h"))

	return &Config{
		AppName:     getEnv("APP_NAME", "Comunidade+"),
		Environment: getEnv("APP_ENV", "development"),
		Port:        port,
		BaseURL:     getEnv("BASE_URL", fmt.Sprintf("http://localhost:%d", port)),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     dbPort,
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "comunidade_plus"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     redisPort,
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       redisDB,

		JWTSecret:        getEnv("JWT_SECRET", "your-256-bit-secret"),
		JWTExpiration:    jwtExpiration,
		JWTRefreshToken:  getEnv("JWT_REFRESH_TOKEN", "your-refresh-token-secret"),
		JWTRefreshExpiry: jwtRefreshExpiry,

		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     smtpPort,
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", ""),

		StorageDriver: getEnv("STORAGE_DRIVER", "local"),
		StoragePath:   getEnv("STORAGE_PATH", "storage"),
		StorageURL:    getEnv("STORAGE_URL", ""),
	}, nil
}

// getEnv retorna o valor da variável de ambiente ou o valor padrão
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

// GetDSN retorna a string de conexão com o banco de dados
func (c *Config) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

// GetRedisAddr retorna o endereço do Redis
func (c *Config) GetRedisAddr() string {
	return fmt.Sprintf("%s:%d", c.RedisHost, c.RedisPort)
}

// IsDevelopment retorna se o ambiente é de desenvolvimento
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction retorna se o ambiente é de produção
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// IsTest retorna se o ambiente é de teste
func (c *Config) IsTest() bool {
	return c.Environment == "test"
}
