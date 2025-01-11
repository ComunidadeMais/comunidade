package logger

import (
	"os"

	"github.com/comunidade/backend/pkg/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var log *zap.Logger

// Init inicializa o logger
func Init(cfg *config.Config) error {
	var err error

	config := zap.NewProductionConfig()

	if cfg.IsDevelopment() {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	config.OutputPaths = []string{"stdout"}
	config.ErrorOutputPaths = []string{"stderr"}

	log, err = config.Build(
		zap.AddCaller(),
		zap.AddCallerSkip(1),
		zap.AddStacktrace(zapcore.ErrorLevel),
	)
	if err != nil {
		return err
	}

	return nil
}

// Info registra uma mensagem no nível info
func Info(msg string, fields ...zapcore.Field) {
	log.Info(msg, fields...)
}

// Debug registra uma mensagem no nível debug
func Debug(msg string, fields ...zapcore.Field) {
	log.Debug(msg, fields...)
}

// Warn registra uma mensagem no nível warn
func Warn(msg string, fields ...zapcore.Field) {
	log.Warn(msg, fields...)
}

// Error registra uma mensagem no nível error
func Error(msg string, fields ...zapcore.Field) {
	log.Error(msg, fields...)
}

// Fatal registra uma mensagem no nível fatal e encerra a aplicação
func Fatal(msg string, fields ...zapcore.Field) {
	log.Fatal(msg, fields...)
	os.Exit(1)
}

// With adiciona campos ao logger
func With(fields ...zapcore.Field) *zap.Logger {
	return log.With(fields...)
}

// Sync sincroniza o buffer do logger
func Sync() error {
	return log.Sync()
}
