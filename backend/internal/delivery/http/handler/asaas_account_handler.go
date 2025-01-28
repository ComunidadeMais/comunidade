package handler

import (
	"net/http"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/comunidade/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type AddAsaasAccountRequest struct {
	Name          string `json:"name" binding:"required"`
	Email         string `json:"email" binding:"required,email"`
	CpfCnpj       string `json:"cpfCnpj" binding:"required"`
	BirthDate     string `json:"birthDate" binding:"required"`
	CompanyType   string `json:"companyType" binding:"required"`
	Phone         string `json:"phone" binding:"required"`
	MobilePhone   string `json:"mobilePhone" binding:"required"`
	Address       string `json:"address" binding:"required"`
	AddressNumber string `json:"addressNumber" binding:"required"`
	Complement    string `json:"complement"`
	Province      string `json:"province" binding:"required"`
	PostalCode    string `json:"postalCode" binding:"required"`
}

type WebhookConfig struct {
	Name        string   `json:"name" binding:"required"`
	URL         string   `json:"url" binding:"required,url"`
	Email       string   `json:"email" binding:"required,email"`
	SendType    string   `json:"send_type" binding:"required"`
	Interrupted bool     `json:"interrupted"`
	Enabled     bool     `json:"enabled"`
	APIVersion  int      `json:"api_version" binding:"required"`
	AuthToken   string   `json:"auth_token" binding:"required"`
	Events      []string `json:"events" binding:"required"`
}

type UpdateAsaasAccountRequest struct {
	Name          string `json:"name"`
	Email         string `json:"email" binding:"omitempty,email"`
	CPFCNPJ       string `json:"cpf_cnpj"`
	CompanyType   string `json:"company_type"`
	Phone         string `json:"phone"`
	MobilePhone   string `json:"mobile_phone"`
	Address       string `json:"address"`
	AddressNumber string `json:"address_number"`
	Complement    string `json:"complement"`
	Province      string `json:"province"`
	PostalCode    string `json:"postal_code"`
	BirthDate     string `json:"birth_date"`
}

func (h *Handler) AddAsaasAccount(c *gin.Context) {
	communityID := c.Param("communityId")
	if communityID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da comunidade é obrigatório"})
		return
	}

	var req AddAsaasAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account := &domain.AsaasAccount{
		CommunityID:   communityID,
		Name:          req.Name,
		Email:         req.Email,
		CPFCNPJ:       req.CpfCnpj,
		CompanyType:   req.CompanyType,
		Phone:         req.Phone,
		MobilePhone:   req.MobilePhone,
		Address:       req.Address,
		AddressNumber: req.AddressNumber,
		Complement:    req.Complement,
		Province:      req.Province,
		PostalCode:    req.PostalCode,
		BirthDate:     req.BirthDate,
	}

	asaasService := service.NewAsaasAccountService(h.repos, h.logger)
	createdAccount, err := asaasService.Create(c.Request.Context(), communityID, account)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdAccount)
}

func (h *Handler) UpdateAsaasAccount(c *gin.Context) {
	communityID := c.Param("communityId")
	accountID := c.Param("accountId")
	if communityID == "" || accountID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da comunidade e da conta são obrigatórios"})
		return
	}

	var req UpdateAsaasAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	account, err := h.repos.AsaasAccount.FindByID(c.Request.Context(), communityID, accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if account == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conta não encontrada"})
		return
	}

	// Atualiza apenas os campos fornecidos
	if req.Name != "" {
		account.Name = req.Name
	}
	if req.Email != "" {
		account.Email = req.Email
	}
	if req.CPFCNPJ != "" {
		account.CPFCNPJ = req.CPFCNPJ
	}
	if req.CompanyType != "" {
		account.CompanyType = req.CompanyType
	}
	if req.Phone != "" {
		account.Phone = req.Phone
	}
	if req.MobilePhone != "" {
		account.MobilePhone = req.MobilePhone
	}
	if req.Address != "" {
		account.Address = req.Address
	}
	if req.AddressNumber != "" {
		account.AddressNumber = req.AddressNumber
	}
	if req.Complement != "" {
		account.Complement = req.Complement
	}
	if req.Province != "" {
		account.Province = req.Province
	}
	if req.PostalCode != "" {
		account.PostalCode = req.PostalCode
	}
	if req.BirthDate != "" {
		account.BirthDate = req.BirthDate
	}

	asaasService := service.NewAsaasAccountService(h.repos, h.logger)
	if err := asaasService.UpdateAccount(c.Request.Context(), account); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, account)
}

func (h *Handler) GetAsaasAccount(c *gin.Context) {
	communityID := c.Param("communityId")
	accountID := c.Param("accountId")
	if communityID == "" || accountID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da comunidade e da conta são obrigatórios"})
		return
	}

	account, err := h.repos.AsaasAccount.FindByID(c.Request.Context(), communityID, accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if account == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conta não encontrada"})
		return
	}

	c.JSON(http.StatusOK, account)
}

func (h *Handler) DeleteAsaasAccount(c *gin.Context) {
	communityID := c.Param("communityId")
	accountID := c.Param("accountId")
	if communityID == "" || accountID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da comunidade e da conta são obrigatórios"})
		return
	}

	asaasService := service.NewAsaasAccountService(h.repos, h.logger)
	if err := asaasService.DeleteAccount(c.Request.Context(), communityID, accountID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Conta excluída com sucesso"})
}

func (h *Handler) ListAsaasAccounts(c *gin.Context) {
	communityID := c.Param("communityId")
	if communityID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da comunidade é obrigatório"})
		return
	}

	filter := repository.NewFilterFromQuery(c)
	filter.AddCondition("community_id = ?", communityID)

	accounts, total, err := h.repos.AsaasAccount.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"accounts": accounts,
		"pagination": gin.H{
			"total":    total,
			"page":     filter.Page,
			"per_page": filter.PerPage,
		},
	})
}

// RefreshAccount atualiza os dados da conta com informações do ASAAS
func (h *Handler) RefreshAccount(c *gin.Context) {
	communityID := c.Param("communityId")
	accountID := c.Param("accountId")

	asaasService := service.NewAsaasAccountService(h.repos, h.logger)
	if err := asaasService.RefreshAccountInfo(c.Request.Context(), communityID, accountID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// HandleAsaasAccountStatusWebhook processa webhooks de status da conta do ASAAS
// func (h *Handler) HandleAsaasAccountStatusWebhook(c *gin.Context) {
// 	var event struct {
// 		Event   string `json:"event"`
// 		Account struct {
// 			ID     string `json:"id"`
// 			Status string `json:"status"`
// 		} `json:"account"`
// 	}

// 	if err := c.ShouldBindJSON(&event); err != nil {
// 		h.logger.Error("Erro ao decodificar webhook", zap.Error(err))
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	h.logger.Info("Webhook recebido",
// 		zap.String("event", event.Event),
// 		zap.String("accountId", event.Account.ID),
// 		zap.String("status", event.Account.Status),
// 	)

// 	asaasService := service.NewAsaasAccountService(h.repos, h.logger)
// 	if err := asaasService.HandleAccountStatusWebhook(c.Request.Context(), event); err != nil {
// 		h.logger.Error("Erro ao processar webhook", zap.Error(err))
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.Status(http.StatusOK)
// }

// GetAsaasAccountStatus retorna o status detalhado da conta ASAAS
func (h *Handler) GetAsaasAccountStatus(c *gin.Context) {
	communityID := c.Param("communityId")
	accountID := c.Param("accountId")
	if communityID == "" || accountID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da comunidade e da conta são obrigatórios"})
		return
	}

	// Busca a conta
	account, err := h.repos.AsaasAccount.FindByID(c.Request.Context(), communityID, accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if account == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conta não encontrada"})
		return
	}

	// Consulta o status da conta
	asaasService := service.NewAsaasAccountService(h.repos, h.logger)
	status, err := asaasService.GetAccountStatus(c.Request.Context(), account)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, status)
}
