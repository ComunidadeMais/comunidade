package service

import (
	"crypto/tls"
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
		fromEmail: os.Getenv("FROM_EMAIL"),
		fromName:  os.Getenv("FROM_NAME"),
	}

	// Validar configurações
	if config.host == "" || config.port == "" || config.user == "" || config.pass == "" || config.fromEmail == "" {
		logger.Error("configurações de SMTP incompletas",
			zap.String("host", config.host),
			zap.String("port", config.port),
			zap.String("user", config.user),
			zap.String("fromEmail", config.fromEmail))
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
	s.logger.Info("Preparando para enviar email",
		zap.String("to", job.to),
		zap.String("subject", job.subject),
		zap.String("body", job.body))

	// Montar o email
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	from := fmt.Sprintf("From: %s <%s>\n", s.smtpConfig.fromName, s.smtpConfig.fromEmail)
	to := fmt.Sprintf("To: %s\n", job.to)
	subject := fmt.Sprintf("Subject: %s\n", job.subject)
	msg := []byte(from + to + subject + mime + "\n" + job.body)

	s.logger.Info("Configurações SMTP",
		zap.String("host", s.smtpConfig.host),
		zap.String("port", s.smtpConfig.port),
		zap.String("user", s.smtpConfig.user),
		zap.String("from_name", s.smtpConfig.fromName),
		zap.String("from_email", s.smtpConfig.fromEmail))

	// Configurar conexão TLS
	tlsConfig := &tls.Config{
		ServerName: s.smtpConfig.host,
	}

	// Conectar ao servidor SMTP com TLS
	addr := fmt.Sprintf("%s:%s", s.smtpConfig.host, s.smtpConfig.port)
	s.logger.Info("Tentando conectar com TLS", zap.String("addr", addr))

	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		s.logger.Error("erro ao conectar com TLS", zap.Error(err))
		return fmt.Errorf("erro ao conectar com TLS: %v", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, s.smtpConfig.host)
	if err != nil {
		s.logger.Error("erro ao criar cliente SMTP", zap.Error(err))
		return fmt.Errorf("erro ao criar cliente SMTP: %v", err)
	}
	defer client.Close()

	// Autenticar
	auth := smtp.PlainAuth("", s.smtpConfig.user, s.smtpConfig.pass, s.smtpConfig.host)
	if err := client.Auth(auth); err != nil {
		s.logger.Error("erro na autenticação", zap.Error(err))
		return fmt.Errorf("erro na autenticação: %v", err)
	}

	// Definir remetente e destinatário
	if err := client.Mail(s.smtpConfig.fromEmail); err != nil {
		return fmt.Errorf("erro ao definir remetente: %v", err)
	}
	if err := client.Rcpt(job.to); err != nil {
		return fmt.Errorf("erro ao definir destinatário: %v", err)
	}

	// Enviar a mensagem
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("erro ao iniciar envio de dados: %v", err)
	}
	_, err = w.Write(msg)
	if err != nil {
		return fmt.Errorf("erro ao enviar dados: %v", err)
	}
	err = w.Close()
	if err != nil {
		return fmt.Errorf("erro ao finalizar envio: %v", err)
	}

	s.logger.Info("email enviado com sucesso",
		zap.String("to", job.to),
		zap.String("subject", job.subject))

	return nil
}
