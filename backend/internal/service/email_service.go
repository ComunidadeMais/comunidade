package service

import (
	"fmt"
	"net/smtp"
	"os"
	"sync"

	"go.uber.org/zap"
)

type EmailService struct {
	logger     *zap.Logger
	workerPool chan struct{}
	smtpConfig *smtpConfig
}

type smtpConfig struct {
	host      string
	port      string
	user      string
	pass      string
	fromEmail string
	fromName  string
}

type emailJob struct {
	to      string
	subject string
	body    string
}

func NewEmailService(logger *zap.Logger) *EmailService {
	// Carregar configuração SMTP uma única vez na inicialização
	config := &smtpConfig{
		host:      os.Getenv("SMTP_HOST"),
		port:      os.Getenv("SMTP_PORT"),
		user:      os.Getenv("SMTP_USER"),
		pass:      os.Getenv("SMTP_PASSWORD"),
		fromEmail: os.Getenv("SMTP_FROM_EMAIL"),
		fromName:  os.Getenv("SMTP_FROM_NAME"),
	}

	// Validar configurações
	if config.host == "" || config.port == "" || config.user == "" || config.pass == "" || config.fromEmail == "" {
		logger.Error("configurações de SMTP incompletas")
	}

	return &EmailService{
		logger:     logger,
		workerPool: make(chan struct{}, 10), // Limita a 10 envios simultâneos
		smtpConfig: config,
	}
}

func (s *EmailService) SendEmails(jobs []emailJob) error {
	var wg sync.WaitGroup
	errChan := make(chan error, len(jobs))

	for _, job := range jobs {
		wg.Add(1)
		go func(job emailJob) {
			defer wg.Done()

			// Adquire um slot no worker pool
			s.workerPool <- struct{}{}
			defer func() { <-s.workerPool }() // Libera o slot quando terminar

			if err := s.sendEmail(job); err != nil {
				errChan <- fmt.Errorf("erro ao enviar email para %s: %v", job.to, err)
				return
			}
		}(job)
	}

	// Espera todos os workers terminarem
	wg.Wait()
	close(errChan)

	// Coleta erros
	var errors []error
	for err := range errChan {
		errors = append(errors, err)
	}

	if len(errors) > 0 {
		return fmt.Errorf("erros ao enviar emails: %v", errors)
	}

	return nil
}

func (s *EmailService) SendEmail(to, subject, body string) error {
	job := emailJob{
		to:      to,
		subject: subject,
		body:    body,
	}
	return s.sendEmail(job)
}

func (s *EmailService) sendEmail(job emailJob) error {
	// Montar o email
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	from := fmt.Sprintf("From: %s <%s>\n", s.smtpConfig.fromName, s.smtpConfig.fromEmail)
	to := fmt.Sprintf("To: %s\n", job.to)
	subject := fmt.Sprintf("Subject: %s\n", job.subject)
	msg := []byte(from + to + subject + mime + "\n" + job.body)

	// Configurar autenticação
	auth := smtp.PlainAuth("", s.smtpConfig.user, s.smtpConfig.pass, s.smtpConfig.host)

	// Enviar email
	addr := fmt.Sprintf("%s:%s", s.smtpConfig.host, s.smtpConfig.port)
	if err := smtp.SendMail(addr, auth, s.smtpConfig.fromEmail, []string{job.to}, msg); err != nil {
		s.logger.Error("erro ao enviar email",
			zap.Error(err),
			zap.String("to", job.to),
			zap.String("subject", job.subject),
		)
		return fmt.Errorf("erro ao enviar email: %v", err)
	}

	s.logger.Info("email enviado com sucesso",
		zap.String("to", job.to),
		zap.String("subject", job.subject),
	)

	return nil
}
