package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AddDonationRequest struct {
	CampaignID    string  `json:"campaign_id" binding:"required"`
	DonorType     string  `json:"donor_type" binding:"required"`
	DonorID       string  `json:"donor_id" binding:"required"`
	Amount        float64 `json:"amount" binding:"required"`
	PaymentMethod string  `json:"payment_method" binding:"required"`
	DueDate       string  `json:"due_date" binding:"required"`
	Description   string  `json:"description" binding:"required"`
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

	switch req.DonorType {
	case "member":
		member, err := h.repos.Member.FindByID(c.Request.Context(), communityID, req.DonorID)
		if err != nil {
			h.logger.Error("erro ao buscar membro", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar informações do membro"})
			return
		}
		if member == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
			return
		}

		// Criar uma única doação para o membro
		donation := createDonation(member, req, communityID, userID, dueDate)
		if err := processDonation(c, h, donation); err != nil {
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":  "Doação criada com sucesso",
			"donation": donation,
		})

	case "family":
		family, err := h.repos.Family.FindByID(c.Request.Context(), communityID, req.DonorID)
		if err != nil {
			h.logger.Error("erro ao buscar família", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar informações da família"})
			return
		}
		if family == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Família não encontrada"})
			return
		}

		// Buscar todos os membros da família
		familyMembers, err := h.repos.Member.FindByFamilyID(c.Request.Context(), communityID, family.ID)
		if err != nil {
			h.logger.Error("erro ao buscar membros da família", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar membros da família"})
			return
		}

		if len(familyMembers) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Família não possui membros"})
			return
		}

		var donations []*domain.Donation
		// Criar uma doação para cada membro da família
		for _, member := range familyMembers {
			donation := createDonation(member, req, communityID, userID, dueDate)
			if err := processDonation(c, h, donation); err != nil {
				return
			}
			donations = append(donations, donation)
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":   "Doações criadas com sucesso",
			"donations": donations,
		})

	case "group":
		group, err := h.repos.Group.FindByID(c.Request.Context(), communityID, req.DonorID)
		if err != nil {
			h.logger.Error("erro ao buscar grupo", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar informações do grupo"})
			return
		}
		if group == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Grupo não encontrado"})
			return
		}

		// Buscar todos os membros do grupo
		groupMembers, err := h.repos.Member.FindByGroupID(c.Request.Context(), communityID, group.ID)
		if err != nil {
			h.logger.Error("erro ao buscar membros do grupo", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar membros do grupo"})
			return
		}

		if len(groupMembers) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Grupo não possui membros"})
			return
		}

		var donations []*domain.Donation
		// Criar uma doação para cada membro do grupo
		for _, member := range groupMembers {
			donation := createDonation(member, req, communityID, userID, dueDate)
			if err := processDonation(c, h, donation); err != nil {
				return
			}
			donations = append(donations, donation)
		}

		c.JSON(http.StatusCreated, gin.H{
			"message":   "Doações criadas com sucesso",
			"donations": donations,
		})

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo de doador inválido"})
		return
	}
}

// Função auxiliar para criar uma doação para um membro
func createDonation(member *domain.Member, req AddDonationRequest, communityID, userID string, dueDate time.Time) *domain.Donation {
	return &domain.Donation{
		ID:            uuid.New().String(),
		CommunityID:   communityID,
		UserID:        userID,
		CampaignID:    req.CampaignID,
		MemberID:      &member.ID,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		DueDate:       dueDate,
		Description:   req.Description,
		Status:        "pending",
		CustomerName:  member.Name,
		CustomerCPF:   member.CPF,
		CustomerEmail: member.Email,
		CustomerPhone: member.Phone,
		BillingAddress: struct {
			Street     string `json:"street" gorm:"not null"`
			Number     string `json:"number" gorm:"not null"`
			Complement string `json:"complement"`
			District   string `json:"district" gorm:"not null"`
			City       string `json:"city" gorm:"not null"`
			State      string `json:"state" gorm:"not null"`
			ZipCode    string `json:"zip_code" gorm:"not null"`
		}{
			Street:  member.Address,
			City:    member.City,
			State:   member.State,
			ZipCode: member.ZipCode,
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

// Função auxiliar para processar uma doação (criar cliente e pagamento no ASAAS)
func processDonation(c *gin.Context, h *Handler, donation *domain.Donation) error {
	// 1. Criar ou obter o cliente no ASAAS
	customerID, err := h.services.Asaas.CreateCustomer(c.Request.Context(), donation.CommunityID, donation)
	if err != nil {
		h.logger.Error("erro ao criar cliente no ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar cliente"})
		return err
	}

	// 2. Criar o pagamento no ASAAS
	paymentID, err := h.services.Asaas.CreatePayment(c.Request.Context(), donation.CommunityID, donation, customerID)
	if err != nil {
		h.logger.Error("erro ao criar pagamento no ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar pagamento"})
		return err
	}

	// Atualiza os IDs do ASAAS na doação
	donation.AsaasID = paymentID

	// 3. Salva a doação no banco
	if err := h.repos.Donation.Create(c.Request.Context(), donation); err != nil {
		h.logger.Error("erro ao criar doação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return err
	}

	// 4. Atualiza a doação com o link de pagamento
	if donation.PaymentLink != "" {
		if err := h.repos.Donation.Update(c.Request.Context(), donation); err != nil {
			h.logger.Error("erro ao atualizar link de pagamento", zap.Error(err))
			// Não retornamos erro aqui pois a doação já foi criada
		}
	}

	return nil
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

	// 1. Criar ou obter o cliente no ASAAS
	customerID, err := h.services.Asaas.CreateCustomerFromRecurringDonation(c.Request.Context(), communityID, recurringDonation)
	if err != nil {
		h.logger.Error("erro ao criar cliente no ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar cliente"})
		return
	}

	// 2. Criar a assinatura no ASAAS
	subscriptionID, err := h.services.Asaas.CreateSubscription(c.Request.Context(), communityID, recurringDonation, customerID)
	if err != nil {
		h.logger.Error("erro ao criar assinatura no ASAAS", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar assinatura"})
		return
	}

	// Atualiza os IDs do ASAAS na doação recorrente
	recurringDonation.AsaasID = subscriptionID

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

// UpdateDonation atualiza uma doação existente
func (h *Handler) UpdateDonation(c *gin.Context) {
	communityID := c.Param("communityId")
	donationID := c.Param("donationId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Busca a doação
	donation, err := h.repos.Donation.FindByID(context.Background(), communityID, donationID)
	if err != nil {
		h.logger.Error("erro ao buscar doação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if donation == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doação não encontrada"})
		return
	}

	// Estrutura para receber os dados da requisição
	type UpdateDonationRequest struct {
		Amount        float64 `json:"amount" binding:"required"`
		DueDate       string  `json:"due_date" binding:"required"`
		Description   string  `json:"description" binding:"required"`
		PaymentMethod string  `json:"payment_method" binding:"required"`
		Status        string  `json:"status" binding:"required"`
	}

	// Faz o bind dos dados da requisição
	var req UpdateDonationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Parse da data no formato YYYY-MM-DD
	dueDate, err := time.Parse("2006-01-02", req.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data de vencimento inválida", "details": err.Error()})
		return
	}

	// Atualiza os dados da doação
	donation.Amount = req.Amount
	donation.DueDate = dueDate
	donation.Description = req.Description
	donation.PaymentMethod = req.PaymentMethod
	donation.Status = req.Status
	donation.UpdatedAt = time.Now()

	// Atualiza a cobrança no ASAAS
	if donation.AsaasPaymentID != "" {
		if err := h.services.Asaas.UpdatePayment(context.Background(), communityID, donation.AsaasPaymentID, donation); err != nil {
			h.logger.Error("erro ao atualizar cobrança no ASAAS", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar cobrança no ASAAS"})
			return
		}
	}

	// Salva as alterações no banco
	if err := h.repos.Donation.Update(context.Background(), donation); err != nil {
		h.logger.Error("erro ao atualizar doação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar doação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Doação atualizada com sucesso",
		"donation": donation,
	})
}

// DeleteDonation exclui uma doação
func (h *Handler) DeleteDonation(c *gin.Context) {
	communityID := c.Param("communityId")
	donationID := c.Param("donationId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Busca a doação
	donation, err := h.repos.Donation.FindByID(context.Background(), communityID, donationID)
	if err != nil {
		h.logger.Error("erro ao buscar doação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if donation == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doação não encontrada"})
		return
	}

	// Exclui a cobrança no ASAAS
	if donation.AsaasPaymentID != "" {
		if err := h.services.Asaas.DeletePayment(context.Background(), communityID, donation.AsaasPaymentID); err != nil {
			h.logger.Error("erro ao excluir cobrança no ASAAS", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir cobrança no ASAAS"})
			return
		}
	}

	// Exclui a doação do banco
	if err := h.repos.Donation.Delete(context.Background(), communityID, donationID); err != nil {
		h.logger.Error("erro ao excluir doação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir doação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Doação excluída com sucesso",
	})
}

// SendPaymentLink envia o link de pagamento por e-mail
func (h *Handler) SendPaymentLink(c *gin.Context) {
	communityID := c.Param("communityId")
	donationID := c.Param("donationId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Busca a doação
	donation, err := h.repos.Donation.FindByID(context.Background(), communityID, donationID)
	if err != nil {
		h.logger.Error("erro ao buscar doação", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if donation == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doação não encontrada"})
		return
	}

	// Verifica se existe um link de pagamento
	if donation.PaymentLink == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Link de pagamento não disponível"})
		return
	}

	// Envia o e-mail através do ASAAS
	if err := h.services.Asaas.SendPaymentLink(context.Background(), communityID, donation.AsaasPaymentID, donation.CustomerEmail); err != nil {
		h.logger.Error("erro ao enviar link de pagamento", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao enviar link de pagamento"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Link de pagamento enviado com sucesso",
	})
}
