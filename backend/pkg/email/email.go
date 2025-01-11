package email

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"

	"github.com/comunidade/backend/pkg/config"
	"gopkg.in/gomail.v2"
)

// Mailer representa um cliente de email
type Mailer struct {
	config *config.Config
	dialer *gomail.Dialer
}

// NewMailer cria um novo cliente de email
func NewMailer(cfg *config.Config) *Mailer {
	dialer := gomail.NewDialer(
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUser,
		cfg.SMTPPassword,
	)

	return &Mailer{
		config: cfg,
		dialer: dialer,
	}
}

// SendEmail envia um email
func (m *Mailer) SendEmail(to, subject, templateName string, data interface{}) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", m.config.SMTPFrom)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)

	body, err := m.parseTemplate(templateName, data)
	if err != nil {
		return fmt.Errorf("erro ao processar template: %v", err)
	}

	msg.SetBody("text/html", body)

	if err := m.dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("erro ao enviar email: %v", err)
	}

	return nil
}

// parseTemplate processa um template de email
func (m *Mailer) parseTemplate(name string, data interface{}) (string, error) {
	templatePath := filepath.Join("templates", "email", name+".html")
	t, err := template.ParseFiles(templatePath)
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	if err = t.Execute(buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// Templates de email

// WelcomeEmailData representa os dados para o email de boas-vindas
type WelcomeEmailData struct {
	Name     string
	Email    string
	Password string
}

// SendWelcomeEmail envia um email de boas-vindas
func (m *Mailer) SendWelcomeEmail(to, name, password string) error {
	data := WelcomeEmailData{
		Name:     name,
		Email:    to,
		Password: password,
	}

	return m.SendEmail(to, "Bem-vindo ao "+m.config.AppName, "welcome", data)
}

// PasswordResetEmailData representa os dados para o email de redefinição de senha
type PasswordResetEmailData struct {
	Name  string
	Token string
	URL   string
}

// SendPasswordResetEmail envia um email de redefinição de senha
func (m *Mailer) SendPasswordResetEmail(to, name, token string) error {
	data := PasswordResetEmailData{
		Name:  name,
		Token: token,
		URL:   fmt.Sprintf("%s/reset-password?token=%s", m.config.BaseURL, token),
	}

	return m.SendEmail(to, "Redefinição de Senha - "+m.config.AppName, "password_reset", data)
}

// EmailVerificationData representa os dados para o email de verificação
type EmailVerificationData struct {
	Name  string
	Token string
	URL   string
}

// SendEmailVerification envia um email de verificação
func (m *Mailer) SendEmailVerification(to, name, token string) error {
	data := EmailVerificationData{
		Name:  name,
		Token: token,
		URL:   fmt.Sprintf("%s/verify-email?token=%s", m.config.BaseURL, token),
	}

	return m.SendEmail(to, "Verificação de Email - "+m.config.AppName, "email_verification", data)
}
