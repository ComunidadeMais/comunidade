package handler

import (
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AddDonationRequest struct {
	CampaignID     string  `json:"campaign_id" binding:"required"`
	MemberID       *string `json:"member_id"`
	Amount         float64 `json:"amount" binding:"required"`
	PaymentMethod  string  `json:"payment_method" binding:"required"`
	DueDate        string  `json:"due_date" binding:"required"`
	Description    string  `json:"description" binding:"required"`
	CustomerName   string  `json:"customer_name" binding:"required"`
	CustomerCPF    string  `json:"customer_cpf" binding:"required"`
	CustomerEmail  string  `json:"customer_email" binding:"required"`
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
}

type AddRecurringDonationRequest struct {
	MemberID       *string `json:"member_id"`
	Amount         float64 `json:"amount" binding:"required"`
	PaymentMethod  string  `json:"payment_method" binding:"required"`
	DueDay         int     `json:"due_day" binding:"required"`
	Description    string  `json:"description" binding:"required"`
	CustomerName   string  `json:"customer_name" binding:"required"`
	CustomerCPF    string  `json:"customer_cpf" binding:"required"`
	CustomerEmail  string  `json:"customer_email" binding:"required"`
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
}

func (h *Handler) AddDonation(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	var req AddDonationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	dueDate, err := time.Parse("2006-01-02", req.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data de vencimento inválida"})
		return
	}

	donation := &domain.Donation{
		ID:            uuid.New().String(),
		CommunityID:   communityID,
		UserID:        userID,
		CampaignID:    req.CampaignID,
		MemberID:      req.MemberID,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		DueDate:       dueDate,
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
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.repos.Donation.Create(c.Request.Context(), donation); err != nil {
		h.logger.Error("erro ao criar doação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Doação criada com sucesso",
		"donation": donation,
	})
}

func (h *Handler) ListDonations(c *gin.Context) {
	communityID := c.Param("communityId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
	}

	donations, err := h.repos.Donation.List(c.Request.Context(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar doações", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"donations": donations,
	})
}

func (h *Handler) AddRecurringDonation(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	var req AddRecurringDonationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	recurringDonation := &domain.RecurringDonation{
		ID:            uuid.New().String(),
		CommunityID:   communityID,
		UserID:        userID,
		MemberID:      req.MemberID,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
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
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.repos.RecurringDonation.Create(c.Request.Context(), recurringDonation); err != nil {
		h.logger.Error("erro ao criar doação recorrente", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":           "Doação recorrente criada com sucesso",
		"recurringDonation": recurringDonation,
	})
}

func (h *Handler) ListRecurringDonations(c *gin.Context) {
	communityID := c.Param("communityId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(c.Request.Context(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
	}

	recurringDonations, err := h.repos.RecurringDonation.List(c.Request.Context(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar doações recorrentes", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"recurringDonations": recurringDonations,
	})
}
