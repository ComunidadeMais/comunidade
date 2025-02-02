package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"go.uber.org/zap"
)

type AsaasService struct {
	repos  *repository.Repositories
	logger *zap.Logger
}

func NewAsaasService(repos *repository.Repositories, logger *zap.Logger) *AsaasService {
	return &AsaasService{
		repos:  repos,
		logger: logger,
	}
}

type AsaasCustomer struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	CPF       string `json:"cpfCnpj"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	Number    string `json:"addressNumber"`
	District  string `json:"province"`
	City      string `json:"city"`
	State     string `json:"state"`
	ZipCode   string `json:"postalCode"`
	NotifyVia string `json:"notificationDisabled"`
}

type AsaasPayment struct {
	ID                   string                 `json:"id"`
	Customer             string                 `json:"customer"`
	BillingType          string                 `json:"billingType"`
	Value                float64                `json:"value"`
	DueDate              string                 `json:"dueDate"`
	Description          string                 `json:"description"`
	ExternalReference    string                 `json:"externalReference"`
	CreditCard           *AsaasCreditCard       `json:"creditCard,omitempty"`
	CreditCardHolderInfo *AsaasCreditCardHolder `json:"creditCardHolderInfo,omitempty"`
}

type AsaasCreditCard struct {
	HolderName  string `json:"holderName"`
	Number      string `json:"number"`
	ExpiryMonth string `json:"expiryMonth"`
	ExpiryYear  string `json:"expiryYear"`
	CVV         string `json:"ccv"`
}

type AsaasCreditCardHolder struct {
	Name     string `json:"name"`
	CPF      string `json:"cpf"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Address  string `json:"address"`
	Number   string `json:"addressNumber"`
	District string `json:"province"`
	City     string `json:"city"`
	State    string `json:"state"`
	ZipCode  string `json:"postalCode"`
}

type AsaasSubscription struct {
	ID                   string                 `json:"id"`
	Customer             string                 `json:"customer"`
	BillingType          string                 `json:"billingType"`
	Value                float64                `json:"value"`
	NextDueDate          string                 `json:"nextDueDate"`
	Description          string                 `json:"description"`
	ExternalReference    string                 `json:"externalReference"`
	CreditCard           *AsaasCreditCard       `json:"creditCard,omitempty"`
	CreditCardHolderInfo *AsaasCreditCardHolder `json:"creditCardHolderInfo,omitempty"`
}

func (s *AsaasService) CreateCustomer(ctx context.Context, communityID string, donation *domain.Donation) (string, error) {
	config, err := s.repos.AsaasAccount.FindByCommunityID(ctx, communityID)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar configuração do ASAAS: %v", err)
	}
	if config == nil {
		return "", fmt.Errorf("configuração do ASAAS não encontrada")
	}

	// Busca o membro pelo CPF
	member, err := s.repos.Member.FindByCPF(ctx, communityID, donation.CustomerCPF)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar membro: %v", err)
	}

	// Se encontrou o membro e ele já tem ID do ASAAS, retorna o ID existente
	if member != nil && member.AsaasCustomerID != "" {
		return member.AsaasCustomerID, nil
	}

	// Prepara os dados do cliente
	customerData := AsaasCustomer{
		Name:      donation.CustomerName,
		CPF:       donation.CustomerCPF,
		Email:     donation.CustomerEmail,
		Phone:     donation.CustomerPhone,
		Address:   donation.BillingAddress.Street,
		Number:    donation.BillingAddress.Number,
		District:  donation.BillingAddress.District,
		City:      donation.BillingAddress.City,
		State:     donation.BillingAddress.State,
		ZipCode:   donation.BillingAddress.ZipCode,
		NotifyVia: "NONE",
	}

	jsonData, err := json.Marshal(customerData)
	if err != nil {
		return "", fmt.Errorf("erro ao serializar dados do cliente: %v", err)
	}

	// Cria a requisição para o ASAAS
	baseURL := os.Getenv("ASAAS_API_URL")
	req, err := http.NewRequestWithContext(ctx, "POST", baseURL+"/customers", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("erro ao criar cliente no ASAAS: %v - %s", resp.Status, string(body))
	}

	var response struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	// Se encontrou o membro, atualiza com o ID do ASAAS
	if member != nil {
		member.AsaasCustomerID = response.ID
		if err := s.repos.Member.Update(ctx, member); err != nil {
			s.logger.Error("erro ao atualizar membro com ID do ASAAS", zap.Error(err))
			// Não retornamos erro aqui pois o cliente já foi criado no ASAAS
		}
	}

	return response.ID, nil
}

func (s *AsaasService) CreatePayment(ctx context.Context, communityID string, donation *domain.Donation, customerID string) (string, error) {
	config, err := s.repos.AsaasAccount.FindByCommunityID(ctx, communityID)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar configuração do ASAAS: %v", err)
	}
	if config == nil {
		return "", fmt.Errorf("configuração do ASAAS não encontrada")
	}

	// Prepara os dados do pagamento
	paymentData := struct {
		Customer          string  `json:"customer"`
		BillingType       string  `json:"billingType"`
		Value             float64 `json:"value"`
		DueDate           string  `json:"dueDate"`
		Description       string  `json:"description"`
		ExternalReference string  `json:"externalReference"`
	}{
		Customer:          customerID,
		BillingType:       s.mapPaymentMethod(donation.PaymentMethod),
		Value:             donation.Amount,
		DueDate:           donation.DueDate.Format("2006-01-02"),
		Description:       donation.Description,
		ExternalReference: donation.ID,
	}

	jsonData, err := json.Marshal(paymentData)
	if err != nil {
		return "", fmt.Errorf("erro ao serializar dados do pagamento: %v", err)
	}

	// Cria a requisição para o ASAAS
	baseURL := os.Getenv("ASAAS_API_URL")
	req, err := http.NewRequestWithContext(ctx, "POST", baseURL+"/payments", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("erro ao criar pagamento no ASAAS: %v - %s", resp.Status, string(body))
	}

	var response struct {
		ID          string `json:"id"`
		PaymentLink string `json:"invoiceUrl"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	// Armazena o link de pagamento na doação
	donation.PaymentLink = response.PaymentLink
	donation.AsaasPaymentID = response.ID

	return response.ID, nil
}

func (s *AsaasService) CreateSubscription(ctx context.Context, communityID string, donation *domain.RecurringDonation, customerID string) (string, error) {
	config, err := s.repos.AsaasConfig.FindByCommunityID(ctx, communityID)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar configuração do ASAAS: %v", err)
	}
	if config == nil {
		return "", fmt.Errorf("configuração do ASAAS não encontrada")
	}

	// Prepara os dados da assinatura
	subscriptionData := struct {
		Customer          string  `json:"customer"`
		BillingType       string  `json:"billingType"`
		Value             float64 `json:"value"`
		NextDueDate       string  `json:"nextDueDate"`
		Description       string  `json:"description"`
		Cycle             string  `json:"cycle"`
		DueDay            int     `json:"dueDay"`
		ExternalReference string  `json:"externalReference"`
	}{
		Customer:          customerID,
		BillingType:       s.mapPaymentMethod(donation.PaymentMethod),
		Value:             donation.Amount,
		NextDueDate:       time.Now().AddDate(0, 0, donation.DueDay).Format("2006-01-02"),
		Description:       donation.Description,
		Cycle:             "MONTHLY",
		DueDay:            donation.DueDay,
		ExternalReference: donation.ID,
	}

	jsonData, err := json.Marshal(subscriptionData)
	if err != nil {
		return "", fmt.Errorf("erro ao serializar dados da assinatura: %v", err)
	}

	// Cria a requisição para o ASAAS
	baseURL := os.Getenv("ASAAS_API_URL")
	req, err := http.NewRequestWithContext(ctx, "POST", baseURL+"/subscriptions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("erro ao criar assinatura no ASAAS: %v - %s", resp.Status, string(body))
	}

	var response struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	return response.ID, nil
}

func (s *AsaasService) CreateCustomerFromRecurringDonation(ctx context.Context, communityID string, donation *domain.RecurringDonation) (string, error) {
	config, err := s.repos.AsaasConfig.FindByCommunityID(ctx, communityID)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar configuração do ASAAS: %v", err)
	}
	if config == nil {
		return "", fmt.Errorf("configuração do ASAAS não encontrada")
	}

	// Busca o membro pelo CPF
	member, err := s.repos.Member.FindByCPF(ctx, communityID, donation.CustomerCPF)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar membro: %v", err)
	}

	// Se encontrou o membro e ele já tem ID do ASAAS, retorna o ID existente
	if member != nil && member.AsaasCustomerID != "" {
		return member.AsaasCustomerID, nil
	}

	// Prepara os dados do cliente
	customerData := AsaasCustomer{
		Name:      donation.CustomerName,
		CPF:       donation.CustomerCPF,
		Email:     donation.CustomerEmail,
		Phone:     donation.CustomerPhone,
		Address:   donation.BillingAddress.Street,
		Number:    donation.BillingAddress.Number,
		District:  donation.BillingAddress.District,
		City:      donation.BillingAddress.City,
		State:     donation.BillingAddress.State,
		ZipCode:   donation.BillingAddress.ZipCode,
		NotifyVia: "NONE",
	}

	jsonData, err := json.Marshal(customerData)
	if err != nil {
		return "", fmt.Errorf("erro ao serializar dados do cliente: %v", err)
	}

	// Cria a requisição para o ASAAS
	baseURL := os.Getenv("ASAAS_API_URL")
	req, err := http.NewRequestWithContext(ctx, "POST", baseURL+"/customers", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("erro ao criar cliente no ASAAS: %v - %s", resp.Status, string(body))
	}

	var response struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	// Se encontrou o membro, atualiza com o ID do ASAAS
	if member != nil {
		member.AsaasCustomerID = response.ID
		if err := s.repos.Member.Update(ctx, member); err != nil {
			s.logger.Error("erro ao atualizar membro com ID do ASAAS", zap.Error(err))
			// Não retornamos erro aqui pois o cliente já foi criado no ASAAS
		}
	}

	return response.ID, nil
}

func (s *AsaasService) mapPaymentMethod(method string) string {
	switch method {
	case "credit_card":
		return "CREDIT_CARD"
	case "boleto":
		return "BOLETO"
	case "pix":
		return "PIX"
	default:
		return "UNDEFINED"
	}
}

// UpdatePayment atualiza uma cobrança existente no ASAAS
func (s *AsaasService) UpdatePayment(ctx context.Context, communityID string, paymentID string, payment *domain.Donation) error {
	config, err := s.repos.AsaasAccount.FindByCommunityID(ctx, communityID)
	if err != nil {
		return fmt.Errorf("erro ao buscar configuração do ASAAS: %v", err)
	}
	if config == nil {
		return fmt.Errorf("configuração do ASAAS não encontrada")
	}

	// Prepara os dados do pagamento
	paymentData := struct {
		Value       float64 `json:"value"`
		DueDate     string  `json:"dueDate"`
		Description string  `json:"description"`
	}{
		Value:       payment.Amount,
		DueDate:     payment.DueDate.Format("2006-01-02"),
		Description: payment.Description,
	}

	jsonData, err := json.Marshal(paymentData)
	if err != nil {
		return fmt.Errorf("erro ao serializar dados do pagamento: %v", err)
	}

	// Cria a requisição para o ASAAS
	baseURL := os.Getenv("ASAAS_API_URL")
	req, err := http.NewRequestWithContext(ctx, "PUT", fmt.Sprintf("%s/payments/%s", baseURL, paymentID), bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("erro ao atualizar pagamento no ASAAS: %v - %s", resp.Status, string(body))
	}

	return nil
}

// DeletePayment exclui uma cobrança no ASAAS
func (s *AsaasService) DeletePayment(ctx context.Context, communityID string, paymentID string) error {
	config, err := s.repos.AsaasAccount.FindByCommunityID(ctx, communityID)
	if err != nil {
		return fmt.Errorf("erro ao buscar configuração do ASAAS: %v", err)
	}
	if config == nil {
		return fmt.Errorf("configuração do ASAAS não encontrada")
	}

	// Cria a requisição para o ASAAS
	baseURL := os.Getenv("ASAAS_API_URL")
	req, err := http.NewRequestWithContext(ctx, "DELETE", fmt.Sprintf("%s/payments/%s", baseURL, paymentID), nil)
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("access_token", config.ApiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("erro ao excluir pagamento no ASAAS: %v - %s", resp.Status, string(body))
	}

	return nil
}

// SendPaymentLink envia o link de pagamento por e-mail
func (s *AsaasService) SendPaymentLink(ctx context.Context, communityID, paymentID, email string) error {
	config, err := s.repos.AsaasAccount.FindByCommunityID(ctx, communityID)
	if err != nil {
		return fmt.Errorf("erro ao buscar configuração do ASAAS: %v", err)
	}
	if config == nil {
		return fmt.Errorf("configuração do ASAAS não encontrada")
	}

	// Cria a requisição para o ASAAS
	baseURL := os.Getenv("ASAAS_API_URL")
	url := fmt.Sprintf("%s/payments/%s/paymentLink", baseURL, paymentID)

	// Prepara o payload
	payload := map[string]string{
		"email": email,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("erro ao serializar dados do e-mail: %v", err)
	}

	// Cria a requisição
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	// Verifica se a requisição foi bem sucedida
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("erro ao enviar link de pagamento: %v - %s", resp.Status, string(body))
	}

	return nil
}
