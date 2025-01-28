package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AsaasAccountService struct {
	repos      *repository.Repositories
	logger     *zap.Logger
	config     *Config
	httpClient *http.Client
}

type Config struct {
	BaseURL     string
	AccessToken string
}

func NewAsaasAccountService(repos *repository.Repositories, logger *zap.Logger) *AsaasAccountService {
	return &AsaasAccountService{
		repos:      repos,
		logger:     logger,
		httpClient: &http.Client{},
		config: &Config{
			BaseURL:     os.Getenv("ASAAS_API_URL"),
			AccessToken: os.Getenv("ASAAS_API_KEY"),
		},
	}
}

type AsaasAccountRequest struct {
	Name          string         `json:"name"`
	Email         string         `json:"email"`
	LoginEmail    string         `json:"loginEmail"`
	CPFCNPJ       string         `json:"cpfCnpj"`
	BirthDate     string         `json:"birthDate"`
	CompanyType   string         `json:"companyType"`
	Phone         string         `json:"phone,omitempty"`
	MobilePhone   string         `json:"mobilePhone,omitempty"`
	Site          string         `json:"site"`
	IncomeValue   float64        `json:"incomeValue"`
	Address       string         `json:"address"`
	AddressNumber string         `json:"addressNumber"`
	Complement    string         `json:"complement,omitempty"`
	Province      string         `json:"province"`
	PostalCode    string         `json:"postalCode"`
	Webhooks      []AsaasWebhook `json:"webhooks"`
}

type AsaasWebhook struct {
	Name        string   `json:"name"`
	URL         string   `json:"url"`
	Email       string   `json:"email"`
	Enabled     bool     `json:"enabled"`
	Interrupted bool     `json:"interrupted"`
	APIVersion  int      `json:"apiVersion"`
	AuthToken   string   `json:"authToken"`
	SendType    string   `json:"sendType"`
	Events      []string `json:"events"`
}

type WebhookConfig struct {
	Name        string   `json:"name"`
	URL         string   `json:"url"`
	Email       string   `json:"email"`
	SendType    string   `json:"sendType"`
	Interrupted bool     `json:"interrupted"`
	Enabled     bool     `json:"enabled"`
	APIVersion  int      `json:"apiVersion"`
	AuthToken   string   `json:"authToken"`
	Events      []string `json:"events"`
}

type AsaasAccountResponse struct {
	ID              string `json:"id"`
	WalletId        string `json:"walletId"`
	ApiKey          string `json:"apiKey"`
	Bank            string `json:"bank"`
	BankAgency      string `json:"bankAgency"`
	BankAccount     string `json:"bankAccount"`
	BankAccountType string `json:"bankAccountType"`
	CommercialInfo  string `json:"commercialInfo"`
	BankAccountInfo string `json:"bankAccountInfo"`
	Documentation   string `json:"documentation"`
	GeneralStatus   string `json:"generalStatus"`
}

type AsaasAccountAPIResponse struct {
	Object        string  `json:"object"`
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Email         string  `json:"email"`
	LoginEmail    string  `json:"loginEmail"`
	Phone         string  `json:"phone"`
	MobilePhone   string  `json:"mobilePhone"`
	Address       string  `json:"address"`
	AddressNumber string  `json:"addressNumber"`
	Complement    string  `json:"complement"`
	Province      string  `json:"province"`
	PostalCode    string  `json:"postalCode"`
	CpfCnpj       string  `json:"cpfCnpj"`
	BirthDate     string  `json:"birthDate"`
	PersonType    string  `json:"personType"`
	CompanyType   *string `json:"companyType"`
	City          int     `json:"city"`
	State         string  `json:"state"`
	Country       string  `json:"country"`
	Site          *string `json:"site"`
	WalletId      string  `json:"walletId"`
	ApiKey        *string `json:"apiKey"`
	AccountNumber struct {
		Agency       string `json:"agency"`
		Account      string `json:"account"`
		AccountDigit string `json:"accountDigit"`
	} `json:"accountNumber"`
	IncomeValue     float64 `json:"incomeValue"`
	CommercialInfo  string  `json:"commercialInfo"`
	BankAccountInfo string  `json:"bankAccountInfo"`
	Documentation   string  `json:"documentation"`
	GeneralStatus   string  `json:"generalStatus"`
}

// Estrutura para a situação cadastral
type AccountStatus struct {
	ID              string `json:"id"`
	CommercialInfo  string `json:"commercialInfo"`
	BankAccountInfo string `json:"bankAccountInfo"`
	Documentation   string `json:"documentation"`
	General         string `json:"general"`
}

func (s *AsaasAccountService) Create(ctx context.Context, communityID string, req *domain.AsaasAccount) (*domain.AsaasAccount, error) {
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "https://comunidade.com.br:8080" // URL padrão para desenvolvimento com HTTPS
	}

	webhooks := []AsaasWebhook{
		{
			Name:        "Notificações de Pagamento",
			URL:         fmt.Sprintf("%s/api/v1/webhooks/asaas/account-status", apiURL),
			Email:       req.Email,
			Enabled:     true,
			Interrupted: false,
			APIVersion:  3,
			AuthToken:   uuid.New().String(),
			SendType:    "SEQUENTIALLY",
			Events:      []string{"PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"},
		},
	}

	accountRequest := &AsaasAccountRequest{
		Name:          req.Name,
		Email:         req.Email,
		LoginEmail:    req.Email,
		CPFCNPJ:       req.CPFCNPJ,
		BirthDate:     req.BirthDate,
		CompanyType:   req.CompanyType,
		Phone:         req.Phone,
		MobilePhone:   req.MobilePhone,
		Site:          "",
		IncomeValue:   1000,
		Address:       req.Address,
		AddressNumber: req.AddressNumber,
		Complement:    req.Complement,
		Province:      req.Province,
		PostalCode:    req.PostalCode,
		Webhooks:      webhooks,
	}

	jsonData, err := json.Marshal(accountRequest)
	if err != nil {
		return nil, fmt.Errorf("error marshaling account request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", s.config.BaseURL+"/accounts", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("access_token", s.config.AccessToken)

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("error creating account, status: %d, body: %s", resp.StatusCode, string(body))
	}

	var asaasResp struct {
		Object        string `json:"object"`
		ID            string `json:"id"`
		WalletId      string `json:"walletId"`
		ApiKey        string `json:"apiKey"`
		AccountNumber struct {
			Agency       string `json:"agency"`
			Account      string `json:"account"`
			AccountDigit string `json:"accountDigit"`
		} `json:"accountNumber"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&asaasResp); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	req.AsaasID = asaasResp.ID
	req.WalletId = asaasResp.WalletId
	req.ApiKey = asaasResp.ApiKey
	req.Bank = asaasResp.AccountNumber.Agency
	req.BankAccount = asaasResp.AccountNumber.Account + asaasResp.AccountNumber.AccountDigit
	req.BankAgency = asaasResp.AccountNumber.Agency
	req.Status = "active"
	req.CommunityID = communityID

	// Gera o link de onboarding
	onboardingURL, err := s.generateOnboardingURL(ctx, req.AsaasID)
	if err != nil {
		s.logger.Error("Erro ao gerar link de onboarding", zap.Error(err))
	} else {
		req.OnboardingUrl = onboardingURL
	}

	if err := s.repos.AsaasAccount.Create(ctx, req); err != nil {
		return nil, fmt.Errorf("error saving account: %w", err)
	}

	return req, nil
}

func (s *AsaasAccountService) generateOnboardingURL(ctx context.Context, accountID string) (string, error) {
	baseURL := os.Getenv("ASAAS_API_URL")
	apiKey := os.Getenv("ASAAS_API_KEY")

	req, err := http.NewRequestWithContext(ctx, "POST", baseURL+fmt.Sprintf("/accounts/%s/onboarding", accountID), nil)
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição de onboarding: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("access_token", apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro ao executar requisição de onboarding: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("erro ao gerar link de onboarding: %v", resp.Status)
	}

	var onboardingResponse struct {
		URL string `json:"url"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&onboardingResponse); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta de onboarding: %v", err)
	}

	return onboardingResponse.URL, nil
}

func (s *AsaasAccountService) GetAccountInfo(ctx context.Context, accountID string) (*domain.AsaasAccount, error) {
	baseURL := os.Getenv("ASAAS_API_URL")
	apiKey := os.Getenv("ASAAS_API_KEY")

	req, err := http.NewRequestWithContext(ctx, "GET", baseURL+"/accounts/"+accountID, nil)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("access_token", apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("erro ao obter informações da conta: %v", resp.Status)
	}

	var apiResponse AsaasAccountAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	// Converte a resposta da API para o modelo de domínio
	account := &domain.AsaasAccount{
		AsaasID:         apiResponse.ID,
		Name:            apiResponse.Name,
		Email:           apiResponse.Email,
		CPFCNPJ:         apiResponse.CpfCnpj,
		Phone:           apiResponse.Phone,
		MobilePhone:     apiResponse.MobilePhone,
		Address:         apiResponse.Address,
		AddressNumber:   apiResponse.AddressNumber,
		Complement:      apiResponse.Complement,
		Province:        apiResponse.Province,
		PostalCode:      apiResponse.PostalCode,
		BirthDate:       apiResponse.BirthDate,
		WalletId:        apiResponse.WalletId,
		PersonType:      apiResponse.PersonType,
		Bank:            apiResponse.AccountNumber.Agency,
		BankAgency:      apiResponse.AccountNumber.Agency,
		BankAccount:     apiResponse.AccountNumber.Account + "-" + apiResponse.AccountNumber.AccountDigit,
		CommercialInfo:  apiResponse.CommercialInfo,
		BankAccountInfo: apiResponse.BankAccountInfo,
		Documentation:   apiResponse.Documentation,
		GeneralStatus:   apiResponse.GeneralStatus,
	}

	// Trata campos opcionais
	if apiResponse.CompanyType != nil {
		account.CompanyType = *apiResponse.CompanyType
	}
	if apiResponse.ApiKey != nil {
		account.ApiKey = *apiResponse.ApiKey
	}

	return account, nil
}

func (s *AsaasAccountService) UpdateAccount(ctx context.Context, account *domain.AsaasAccount) error {
	// Prepara os dados para envio ao ASAAS
	accountRequest := &AsaasAccountRequest{
		Name:          account.Name,
		Email:         account.Email,
		CPFCNPJ:       account.CPFCNPJ,
		CompanyType:   account.CompanyType,
		Phone:         account.Phone,
		MobilePhone:   account.MobilePhone,
		Address:       account.Address,
		AddressNumber: account.AddressNumber,
		Complement:    account.Complement,
		Province:      account.Province,
		PostalCode:    account.PostalCode,
		BirthDate:     account.BirthDate,
		IncomeValue:   1000.00,
	}

	// Converte os webhooks
	webhooks := make([]WebhookConfig, len(account.Webhooks))
	for i, w := range account.Webhooks {
		webhooks[i] = WebhookConfig{
			Name:        w.Name,
			URL:         w.URL,
			Email:       w.Email,
			SendType:    w.SendType,
			Interrupted: w.Interrupted,
			Enabled:     w.Enabled,
			APIVersion:  w.APIVersion,
			AuthToken:   w.AuthToken,
			Events:      w.Events,
		}
	}

	jsonData, err := json.Marshal(accountRequest)
	if err != nil {
		return fmt.Errorf("erro ao serializar dados da conta: %v", err)
	}

	// Log do payload
	s.logger.Info("Payload enviado para ASAAS", zap.String("payload", string(jsonData)))

	// Obtém a URL base e chave de API do ambiente
	baseURL := os.Getenv("ASAAS_API_URL")
	apiKey := os.Getenv("ASAAS_API_KEY")

	// Cria a requisição para o ASAAS
	req, err := http.NewRequestWithContext(ctx, "PUT", baseURL+"/accounts/"+account.AsaasID, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("access_token", apiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("erro ao atualizar conta no ASAAS: %v", resp.Status)
	}

	// Atualiza a conta no banco de dados
	if err := s.repos.AsaasAccount.Update(ctx, account); err != nil {
		return fmt.Errorf("erro ao atualizar conta: %v", err)
	}

	return nil
}

func (s *AsaasAccountService) DeleteAccount(ctx context.Context, communityID, accountID string) error {
	// Obtém a conta do banco de dados
	account, err := s.repos.AsaasAccount.FindByID(ctx, communityID, accountID)
	if err != nil {
		return fmt.Errorf("erro ao buscar conta: %v", err)
	}

	if account == nil {
		return fmt.Errorf("conta não encontrada")
	}

	// Obtém a URL base e chave de API do ambiente
	baseURL := os.Getenv("ASAAS_API_URL")
	apiKey := os.Getenv("ASAAS_API_KEY")

	// Cria a requisição para o ASAAS
	req, err := http.NewRequestWithContext(ctx, "DELETE", baseURL+"/accounts/"+account.AsaasID, nil)
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("access_token", apiKey)

	// Executa a requisição
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("erro ao excluir conta no ASAAS: %v", resp.Status)
	}

	// Remove a conta do banco de dados
	if err := s.repos.AsaasAccount.Delete(ctx, communityID, accountID); err != nil {
		return fmt.Errorf("erro ao excluir conta: %v", err)
	}

	return nil
}

func (s *AsaasAccountService) GetOnboardingURL(ctx context.Context, communityID, accountID string) (string, error) {
	// Busca a conta no banco de dados usando o ID local e o ID da comunidade
	account, err := s.repos.AsaasAccount.FindByID(ctx, communityID, accountID)
	if err != nil {
		return "", fmt.Errorf("erro ao buscar conta: %v", err)
	}

	if account == nil {
		return "", fmt.Errorf("conta não encontrada")
	}

	if account.ApiKey == "" {
		return "", fmt.Errorf("conta não possui chave API")
	}

	baseURL := os.Getenv("ASAAS_API_URL")

	// Log para debug
	s.logger.Info("Buscando documentos da conta",
		zap.String("communityID", communityID),
		zap.String("accountID", accountID),
		zap.String("asaasID", account.AsaasID),
		zap.String("apiKey", "***"+account.ApiKey[len(account.ApiKey)-4:]),
	)

	req, err := http.NewRequestWithContext(ctx, "GET", baseURL+"/myAccount/documents", nil)
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %v", err)
	}

	// Usa a chave API específica da conta
	req.Header.Set("access_token", account.ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro ao executar requisição: %v", err)
	}
	defer resp.Body.Close()

	// Log da resposta para debug
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("erro ao ler corpo da resposta: %v", err)
	}
	s.logger.Info("Resposta da API",
		zap.Int("statusCode", resp.StatusCode),
		zap.String("body", string(body)),
	)

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("erro ao obter documentos: %v - %s", resp.Status, string(body))
	}

	// Recria o reader do body para o decode
	resp.Body = io.NopCloser(bytes.NewBuffer(body))

	var response struct {
		Data []struct {
			OnboardingUrl string `json:"onboardingUrl"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	// Retorna a primeira URL de onboarding encontrada
	for _, doc := range response.Data {
		if doc.OnboardingUrl != "" {
			return doc.OnboardingUrl, nil
		}
	}

	return "", fmt.Errorf("nenhum link de onboarding disponível")
}

func (s *AsaasAccountService) RefreshAccountInfo(ctx context.Context, communityID, accountID string) error {
	// Busca a conta no banco de dados
	account, err := s.repos.AsaasAccount.FindByID(ctx, communityID, accountID)
	if err != nil {
		return fmt.Errorf("erro ao buscar conta: %v", err)
	}

	if account == nil {
		return fmt.Errorf("conta não encontrada")
	}

	// Obtém os dados atualizados da API do ASAAS
	updatedInfo, err := s.GetAccountInfo(ctx, account.AsaasID)
	if err != nil {
		return fmt.Errorf("erro ao obter informações atualizadas: %v", err)
	}

	// Atualiza apenas os campos que podem ser alterados pela API
	account.Bank = updatedInfo.Bank
	account.BankAgency = updatedInfo.BankAgency
	account.BankAccount = updatedInfo.BankAccount
	account.BankAccountType = updatedInfo.BankAccountType
	account.CommercialInfo = updatedInfo.CommercialInfo
	account.BankAccountInfo = updatedInfo.BankAccountInfo
	account.Documentation = updatedInfo.Documentation
	account.GeneralStatus = updatedInfo.GeneralStatus

	// Atualiza o link de onboarding
	onboardingURL, err := s.GetOnboardingURL(ctx, communityID, account.ID)
	if err != nil {
		s.logger.Error("Erro ao obter link de onboarding", zap.Error(err))
	} else {
		account.OnboardingUrl = onboardingURL
	}

	// Salva as atualizações no banco de dados
	if err := s.repos.AsaasAccount.Update(ctx, account); err != nil {
		return fmt.Errorf("erro ao atualizar conta: %v", err)
	}

	return nil
}

// Configura os webhooks para a conta
func (s *AsaasAccountService) SetupWebhooks(ctx context.Context, account *domain.AsaasAccount) error {
	baseURL := os.Getenv("ASAAS_API_URL")
	apiURL := os.Getenv("API_URL") // URL base da nossa API

	// Webhook para status da conta
	webhookConfig := WebhookConfig{
		Name:        "Status da Conta",
		URL:         fmt.Sprintf("%s/api/v1/webhooks/asaas/account-status", apiURL),
		Email:       account.Email,
		SendType:    "SEQUENTIALLY",
		Interrupted: false,
		Enabled:     true,
		APIVersion:  3,
		Events: []string{
			"ACCOUNT.STATUS.COMMERCIAL_INFO",
			"ACCOUNT.STATUS.BANK_ACCOUNT",
			"ACCOUNT.STATUS.DOCUMENTATION",
			"ACCOUNT.STATUS.GENERAL",
		},
	}

	jsonData, err := json.Marshal(webhookConfig)
	if err != nil {
		return fmt.Errorf("erro ao serializar configuração do webhook: %v", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", baseURL+"/api/v3/webhook", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("erro ao criar requisição: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", account.ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("erro ao configurar webhook: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("erro ao configurar webhook: %v - %s", resp.Status, string(body))
	}

	return nil
}

// Consulta a situação cadastral da conta
func (s *AsaasAccountService) GetAccountStatus(ctx context.Context, account *domain.AsaasAccount) (*domain.AccountStatus, error) {
	baseURL := os.Getenv("ASAAS_API_URL")

	req, err := http.NewRequestWithContext(ctx, "GET", baseURL+"/myAccount/status", nil)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição: %v", err)
	}

	// Usa a chave API específica da conta
	req.Header.Set("access_token", account.ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao consultar status: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("erro ao consultar status: %v - %s", resp.Status, string(body))
	}

	var status domain.AccountStatus
	if err := json.NewDecoder(resp.Body).Decode(&status); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	// Log para debug
	s.logger.Info("Status recebido da API",
		zap.String("accountId", account.AsaasID),
		zap.Any("status", status),
	)

	// Atualiza o status da conta no banco de dados
	account.CommercialInfo = status.CommercialInfo
	account.BankAccountInfo = status.BankAccountInfo
	account.Documentation = status.Documentation
	account.GeneralStatus = status.General

	if err := s.repos.AsaasAccount.Update(ctx, account); err != nil {
		s.logger.Error("Erro ao atualizar status da conta no banco de dados", zap.Error(err))
	}

	return &status, nil
}

// Processa o webhook de status da conta
func (s *AsaasAccountService) HandleAccountStatusWebhook(ctx context.Context, event struct {
	Event   string `json:"event"`
	Account struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	} `json:"account"`
}) error {
	// Busca a conta pelo AsaasID
	account, err := s.repos.AsaasAccount.FindByAsaasID(ctx, event.Account.ID)
	if err != nil {
		return fmt.Errorf("erro ao buscar conta: %v", err)
	}

	if account == nil {
		return fmt.Errorf("conta não encontrada: %s", event.Account.ID)
	}

	// Atualiza o status apropriado baseado no evento
	switch event.Event {
	case "ACCOUNT.STATUS.COMMERCIAL_INFO":
		account.CommercialInfo = event.Account.Status
	case "ACCOUNT.STATUS.BANK_ACCOUNT":
		account.BankAccountInfo = event.Account.Status
	case "ACCOUNT.STATUS.DOCUMENTATION":
		account.Documentation = event.Account.Status
	case "ACCOUNT.STATUS.GENERAL":
		account.GeneralStatus = event.Account.Status
	}

	// Atualiza a conta no banco de dados
	if err := s.repos.AsaasAccount.Update(ctx, account); err != nil {
		return fmt.Errorf("erro ao atualizar conta: %v", err)
	}

	return nil
}
