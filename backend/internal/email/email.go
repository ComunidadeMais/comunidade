package email

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"

	"gopkg.in/gomail.v2"
)

type Config struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

type Mailer struct {
	config *Config
	dialer *gomail.Dialer
}

func NewMailer(config *Config) *Mailer {
	dialer := gomail.NewDialer(
		config.Host,
		config.Port,
		config.Username,
		config.Password,
	)

	return &Mailer{
		config: config,
		dialer: dialer,
	}
}

// SendEmail envia um email usando o template de comunicação
func (m *Mailer) SendEmail(to, subject string, data interface{}) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", m.config.From)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)

	// Processar o template
	templatePath := filepath.Join("templates", "email", "communication.html")
	t, err := template.ParseFiles(templatePath)
	if err != nil {
		return fmt.Errorf("erro ao carregar template: %v", err)
	}

	var body bytes.Buffer
	if err := t.Execute(&body, data); err != nil {
		return fmt.Errorf("erro ao processar template: %v", err)
	}

	msg.SetBody("text/html", body.String())

	if err := m.dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("erro ao enviar email: %v", err)
	}

	return nil
}

func (m *Mailer) SendTestEmail(to, fromName string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", fmt.Sprintf("%s <%s>", fromName, m.config.From))
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", "Comunidade+ Teste de Configuração de E-mail")

	body := `
        <h2>Teste de Configuração de E-mail Comunidade+</h2>
        <p>Este é um e-mail de teste para verificar se as configurações de SMTP estão funcionando corretamente.</p>
        <p>Se você recebeu este e-mail, significa que suas configurações estão corretas!</p>
        <br>
        <p>Atenciosamente,<br>Comunidade+</p>
    `

	msg.SetBody("text/html", body)

	if err := m.dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("erro ao enviar e-mail de teste: %v", err)
	}

	return nil
}
