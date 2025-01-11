package email

import (
	"fmt"

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
