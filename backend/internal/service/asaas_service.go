package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
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
	CPF       string `json:"cpf"`
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
	config, err := s.repos.AsaasConfig.FindByCommunityID(ctx, communityID)
	if err != nil {
		return "", fmt.Errorf("error finding asaas config: %v", err)
	}

	customer := &AsaasCustomer{
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
		NotifyVia: "EMAIL",
	}

	jsonData, err := json.Marshal(customer)
	if err != nil {
		return "", fmt.Errorf("error marshaling customer: %v", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", config.ApiEndpoint+"/customers", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error creating customer: %v", resp.Status)
	}

	var result struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding response: %v", err)
	}

	return result.ID, nil
}

func (s *AsaasService) CreatePayment(ctx context.Context, communityID string, donation *domain.Donation, customerID string) (string, error) {
	config, err := s.repos.AsaasConfig.FindByCommunityID(ctx, communityID)
	if err != nil {
		return "", fmt.Errorf("error finding asaas config: %v", err)
	}

	payment := &AsaasPayment{
		Customer:          customerID,
		BillingType:       s.mapPaymentMethod(donation.PaymentMethod),
		Value:             donation.Amount,
		DueDate:           donation.DueDate.Format("2006-01-02"),
		Description:       donation.Description,
		ExternalReference: donation.ID,
	}

	if donation.PaymentMethod == "credit_card" {
		payment.CreditCardHolderInfo = &AsaasCreditCardHolder{
			Name:     donation.CustomerName,
			CPF:      donation.CustomerCPF,
			Email:    donation.CustomerEmail,
			Phone:    donation.CustomerPhone,
			Address:  donation.BillingAddress.Street,
			Number:   donation.BillingAddress.Number,
			District: donation.BillingAddress.District,
			City:     donation.BillingAddress.City,
			State:    donation.BillingAddress.State,
			ZipCode:  donation.BillingAddress.ZipCode,
		}
	}

	jsonData, err := json.Marshal(payment)
	if err != nil {
		return "", fmt.Errorf("error marshaling payment: %v", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", config.ApiEndpoint+"/payments", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error creating payment: %v", resp.Status)
	}

	var result struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding response: %v", err)
	}

	return result.ID, nil
}

func (s *AsaasService) CreateSubscription(ctx context.Context, communityID string, donation *domain.RecurringDonation, customerID string) (string, error) {
	config, err := s.repos.AsaasConfig.FindByCommunityID(ctx, communityID)
	if err != nil {
		return "", fmt.Errorf("error finding asaas config: %v", err)
	}

	nextDueDate := time.Now()
	if nextDueDate.Day() > donation.DueDay {
		nextDueDate = nextDueDate.AddDate(0, 1, 0)
	}
	nextDueDate = time.Date(nextDueDate.Year(), nextDueDate.Month(), donation.DueDay, 0, 0, 0, 0, time.UTC)

	subscription := &AsaasSubscription{
		Customer:          customerID,
		BillingType:       "CREDIT_CARD",
		Value:             donation.Amount,
		NextDueDate:       nextDueDate.Format("2006-01-02"),
		Description:       donation.Description,
		ExternalReference: donation.ID,
		CreditCardHolderInfo: &AsaasCreditCardHolder{
			Name:     donation.CustomerName,
			CPF:      donation.CustomerCPF,
			Email:    donation.CustomerEmail,
			Phone:    donation.CustomerPhone,
			Address:  donation.BillingAddress.Street,
			Number:   donation.BillingAddress.Number,
			District: donation.BillingAddress.District,
			City:     donation.BillingAddress.City,
			State:    donation.BillingAddress.State,
			ZipCode:  donation.BillingAddress.ZipCode,
		},
	}

	jsonData, err := json.Marshal(subscription)
	if err != nil {
		return "", fmt.Errorf("error marshaling subscription: %v", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", config.ApiEndpoint+"/subscriptions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access_token", config.ApiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error creating subscription: %v", resp.Status)
	}

	var result struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding response: %v", err)
	}

	return result.ID, nil
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
