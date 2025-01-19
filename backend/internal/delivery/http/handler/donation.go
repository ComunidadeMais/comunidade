package handler

import (
	"fmt"
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type AddAsaasConfigRequest struct {
	ApiKey       string `json:"api_key" binding:"required"`
	ApiEndpoint  string `json:"api_endpoint" binding:"required"`
	WebhookToken string `json:"webhook_token" binding:"required"`
}

type AddCampaignRequest struct {
	Name        string    `json:"name" binding:"required"`
	Description string    `json:"description" binding:"required"`
	Goal        float64   `json:"goal" binding:"required"`
	StartDate   time.Time `json:"start_date" binding:"required"`
	EndDate     time.Time `json:"end_date" binding:"required"`
}

type AddDonationRequest struct {
	CampaignID     string    `json:"campaign_id"`
	MemberID       *string   `json:"member_id"`
	Amount         float64   `json:"amount" binding:"required"`
	PaymentType    string    `json:"payment_type" binding:"required,oneof=credit_card boleto pix"`
	DueDate        time.Time `json:"due_date" binding:"required"`
	Description    string    `json:"description"`
	CustomerName   string    `json:"customer_name" binding:"required"`
	CustomerCPF    string    `json:"customer_cpf" binding:"required"`
	CustomerEmail  string    `json:"customer_email" binding:"required,email"`
	CustomerPhone  string    `json:"customer_phone" binding:"required"`
	BillingAddress struct {
		Street     string `json:"street" binding:"required"`
		Number     string `json:"number" binding:"required"`
		Complement string `json:"complement"`
		District   string `json:"district" binding:"required"`
		City       string `json:"city" binding:"required"`
		State      string `json:"state" binding:"required"`
		ZipCode    string `json:"zip_code" binding:"required"`
	} `json:"billing_address" binding:"required"`
	CreditCard struct {
		HolderName  string `json:"holder_name"`
		Number      string `json:"number"`
		ExpiryMonth string `json:"expiry_month"`
		ExpiryYear  string `json:"expiry_year"`
		CVV         string `json:"cvv"`
	} `json:"credit_card"`
}

type AddRecurringDonationRequest struct {
	CampaignID     string  `json:"campaign_id"`
	MemberID       *string `json:"member_id"`
	Amount         float64 `json:"amount" binding:"required"`
	PaymentType    string  `json:"payment_type" binding:"required,oneof=credit_card"`
	DueDay         int     `json:"due_day" binding:"required,min=1,max=28"`
	Description    string  `json:"description"`
	CustomerName   string  `json:"customer_name" binding:"required"`
	CustomerCPF    string  `json:"customer_cpf" binding:"required"`
	CustomerEmail  string  `json:"customer_email" binding:"required,email"`
	CustomerPhone  string  `json:"customer_phone" binding:"required"`
	BillingAddress struct {
		Street     string `json:"street" binding:"required"`
		Number     string `json:"number" binding:"required"`
		Complement string `json:"complement"`
		District   string `json:"district" binding:"required"`
		City       string `json:"city" binding:"required"`
		State      string `json:"state" binding:"required"`
		ZipCode    string `json:"zip_code" binding:"required"`
	} `json:"billing_address" binding:"required"`
	CreditCard struct {
		HolderName  string `json:"holder_name" binding:"required"`
		Number      string `json:"number" binding:"required"`
		ExpiryMonth string `json:"expiry_month" binding:"required"`
		ExpiryYear  string `json:"expiry_year" binding:"required"`
		CVV         string `json:"cvv" binding:"required"`
	} `json:"credit_card" binding:"required"`
}

func (h *Handler) AddAsaasConfig(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "community not found"})
		return
	}

	// Verifica se o usuário tem permissão
	if err := h.checkUserPermission(c.Request.Context(), userID, communityID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req AddAsaasConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config := &domain.AsaasConfig{
		CommunityID:  communityID,
		ApiKey:       req.ApiKey,
		ApiEndpoint:  req.ApiEndpoint,
		WebhookToken: req.WebhookToken,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := h.repos.AsaasConfig.Create(c.Request.Context(), config); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, config)
}

func (h *Handler) AddCampaign(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "community not found"})
		return
	}

	// Verifica se o usuário tem permissão
	if err := h.checkUserPermission(c.Request.Context(), userID, communityID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req AddCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	campaign := &domain.Campaign{
		CommunityID: communityID,
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Goal:        req.Goal,
		StartDate:   req.StartDate,
		EndDate:     &req.EndDate,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.Campaign.Create(c.Request.Context(), campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, campaign)
}

func (h *Handler) ListCampaigns(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "community not found"})
		return
	}

	// Verifica se o usuário tem permissão
	if err := h.checkUserPermission(c.Request.Context(), userID, communityID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := repository.NewFilterFromQuery(c)
	campaigns, err := h.repos.Campaign.List(c.Request.Context(), communityID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	total, err := h.repos.Campaign.CountByCommunityID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": campaigns,
		"pagination": gin.H{
			"total": total,
			"page":  filter.Page,
			"size":  filter.PerPage,
		},
	})
}

func (h *Handler) AddDonation(c *gin.Context) {
	communityID := c.Param("communityId")
	if communityID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "community_id is required"})
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	if err := h.checkUserPermission(c.Request.Context(), userID, communityID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req AddDonationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	donation := &domain.Donation{
		CommunityID:   communityID,
		UserID:        userID,
		MemberID:      req.MemberID,
		CampaignID:    req.CampaignID,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentType,
		DueDate:       req.DueDate,
		Description:   req.Description,
		Status:        "pending",
		CustomerName:  req.CustomerName,
		CustomerCPF:   req.CustomerCPF,
		CustomerEmail: req.CustomerEmail,
		CustomerPhone: req.CustomerPhone,
		BillingAddress: struct {
			Street     string `json:"street" gorm:"not null"`
			Number     string `json:"number" gorm:"not null"`
			Complement string `json:"complement"`
			District   string `json:"district" gorm:"not null"`
			City       string `json:"city" gorm:"not null"`
			State      string `json:"state" gorm:"not null"`
			ZipCode    string `json:"zip_code" gorm:"not null"`
		}{
			Street:     req.BillingAddress.Street,
			Number:     req.BillingAddress.Number,
			Complement: req.BillingAddress.Complement,
			District:   req.BillingAddress.District,
			City:       req.BillingAddress.City,
			State:      req.BillingAddress.State,
			ZipCode:    req.BillingAddress.ZipCode,
		},
	}

	// Cria o cliente no Asaas
	customerID, err := h.services.Asaas.CreateCustomer(c.Request.Context(), communityID, donation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("error creating customer: %v", err)})
		return
	}

	// Cria a doação no banco
	if err := h.repos.Donation.Create(c.Request.Context(), donation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Cria o pagamento no Asaas
	asaasID, err := h.services.Asaas.CreatePayment(c.Request.Context(), communityID, donation, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("error creating payment: %v", err)})
		return
	}

	// Atualiza o ID do Asaas na doação
	donation.AsaasID = asaasID
	if err := h.repos.Donation.Update(c.Request.Context(), donation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, donation)
}

func (h *Handler) ListDonations(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "community not found"})
		return
	}

	// Verifica se o usuário tem permissão
	if err := h.checkUserPermission(c.Request.Context(), userID, communityID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := repository.NewFilterFromQuery(c)
	donations, err := h.repos.Donation.List(c.Request.Context(), communityID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	total, err := h.repos.Donation.CountByCommunityID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": donations,
		"pagination": gin.H{
			"total": total,
			"page":  filter.Page,
			"size":  filter.PerPage,
		},
	})
}

func (h *Handler) AddRecurringDonation(c *gin.Context) {
	communityID := c.Param("communityId")
	if communityID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "community_id is required"})
		return
	}

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	if err := h.checkUserPermission(c.Request.Context(), userID, communityID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req AddRecurringDonationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recurringDonation := &domain.RecurringDonation{
		CommunityID:   communityID,
		UserID:        userID,
		MemberID:      req.MemberID,
		CampaignID:    req.CampaignID,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentType,
		DueDay:        req.DueDay,
		Description:   req.Description,
		Status:        "active",
		CustomerName:  req.CustomerName,
		CustomerCPF:   req.CustomerCPF,
		CustomerEmail: req.CustomerEmail,
		CustomerPhone: req.CustomerPhone,
		BillingAddress: struct {
			Street     string `json:"street" gorm:"not null"`
			Number     string `json:"number" gorm:"not null"`
			Complement string `json:"complement"`
			District   string `json:"district" gorm:"not null"`
			City       string `json:"city" gorm:"not null"`
			State      string `json:"state" gorm:"not null"`
			ZipCode    string `json:"zip_code" gorm:"not null"`
		}{
			Street:     req.BillingAddress.Street,
			Number:     req.BillingAddress.Number,
			Complement: req.BillingAddress.Complement,
			District:   req.BillingAddress.District,
			City:       req.BillingAddress.City,
			State:      req.BillingAddress.State,
			ZipCode:    req.BillingAddress.ZipCode,
		},
	}

	// Cria o cliente no Asaas
	customerID, err := h.services.Asaas.CreateCustomer(c.Request.Context(), communityID, &domain.Donation{
		CustomerName:   recurringDonation.CustomerName,
		CustomerCPF:    recurringDonation.CustomerCPF,
		CustomerEmail:  recurringDonation.CustomerEmail,
		CustomerPhone:  recurringDonation.CustomerPhone,
		BillingAddress: recurringDonation.BillingAddress,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("error creating customer: %v", err)})
		return
	}

	// Cria a doação recorrente no banco
	if err := h.repos.RecurringDonation.Create(c.Request.Context(), recurringDonation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Cria a assinatura no Asaas
	asaasID, err := h.services.Asaas.CreateSubscription(c.Request.Context(), communityID, recurringDonation, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("error creating subscription: %v", err)})
		return
	}

	// Atualiza o ID do Asaas na doação recorrente
	recurringDonation.AsaasID = asaasID
	if err := h.repos.RecurringDonation.Update(c.Request.Context(), recurringDonation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, recurringDonation)
}

func (h *Handler) ListRecurringDonations(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "community not found"})
		return
	}

	// Verifica se o usuário tem permissão
	if err := h.checkUserPermission(c.Request.Context(), userID, communityID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	filter := repository.NewFilterFromQuery(c)
	donations, err := h.repos.RecurringDonation.List(c.Request.Context(), communityID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	total, err := h.repos.RecurringDonation.CountByCommunityID(c.Request.Context(), communityID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": donations,
		"pagination": gin.H{
			"total": total,
			"page":  filter.Page,
			"size":  filter.PerPage,
		},
	})
}
