package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// Requisições
type AddFinancialCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Type        string `json:"type" binding:"required,oneof=expense revenue"`
	Description string `json:"description"`
}

type AddSupplierRequest struct {
	Name    string `json:"name" binding:"required"`
	CNPJ    string `json:"cnpj" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	City    string `json:"city"`
	State   string `json:"state"`
	ZipCode string `json:"zip_code"`
	Notes   string `json:"notes"`
}

type AddExpenseRequest struct {
	CategoryID  string    `json:"category_id" binding:"required,uuid"`
	SupplierID  *string   `json:"supplier_id" binding:"omitempty,uuid"`
	EventID     *string   `json:"event_id" binding:"omitempty,uuid"`
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Date        time.Time `json:"date" binding:"required"`
	Description string    `json:"description"`
	Status      string    `json:"status" binding:"required,oneof=pending paid cancelled"`
	PaymentType string    `json:"payment_type"`
	DueDate     time.Time `json:"due_date" binding:"required"`
}

type AddRevenueRequest struct {
	CategoryID  string    `json:"category_id" binding:"required,uuid"`
	EventID     *string   `json:"event_id" binding:"omitempty,uuid"`
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Date        time.Time `json:"date" binding:"required"`
	Description string    `json:"description"`
	Status      string    `json:"status" binding:"required,oneof=pending received cancelled"`
	PaymentType string    `json:"payment_type"`
}

type GenerateReportRequest struct {
	StartDate time.Time `json:"start_date" binding:"required"`
	EndDate   time.Time `json:"end_date" binding:"required"`
	Type      string    `json:"type" binding:"required,oneof=daily weekly monthly yearly custom"`
}

// Handlers para Categorias Financeiras
func (h *Handler) AddFinancialCategory(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	// Verifica se o usuário tem permissão
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para adicionar categorias financeiras"})
		return
	}

	var req AddFinancialCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	category := &domain.FinancialCategory{
		CommunityID: communityID,
		UserID:      user.(*domain.User).ID,
		Name:        req.Name,
		Type:        req.Type,
		Description: req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.FinancialCategory.Create(context.Background(), category); err != nil {
		h.logger.Error("erro ao criar categoria financeira", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar categoria financeira"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Categoria financeira criada com sucesso",
		"category": category,
	})
}

func (h *Handler) ListFinancialCategories(c *gin.Context) {
	communityID := c.Param("communityId")

	filter := repository.NewFilterFromQuery(c)

	categories, total, err := h.repos.FinancialCategory.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar categorias financeiras", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao listar categorias financeiras"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories": categories,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

// Handlers para Fornecedores
func (h *Handler) AddSupplier(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	// Verifica se o usuário tem permissão
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para adicionar fornecedores"})
		return
	}

	var req AddSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	supplier := &domain.Supplier{
		CommunityID: communityID,
		UserID:      user.(*domain.User).ID,
		Name:        req.Name,
		CNPJ:        req.CNPJ,
		Email:       req.Email,
		Phone:       req.Phone,
		Address:     req.Address,
		City:        req.City,
		State:       req.State,
		ZipCode:     req.ZipCode,
		Notes:       req.Notes,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.Supplier.Create(context.Background(), supplier); err != nil {
		h.logger.Error("erro ao criar fornecedor", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar fornecedor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Fornecedor criado com sucesso",
		"supplier": supplier,
	})
}

func (h *Handler) ListSuppliers(c *gin.Context) {
	communityID := c.Param("communityId")

	filter := repository.NewFilterFromQuery(c)

	suppliers, total, err := h.repos.Supplier.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar fornecedores", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao listar fornecedores"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"suppliers": suppliers,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

// Handlers para Despesas
func (h *Handler) AddExpense(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	// Verifica se o usuário tem permissão
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para adicionar despesas"})
		return
	}

	var req AddExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verifica se a categoria existe
	category, err := h.repos.FinancialCategory.FindByID(context.Background(), communityID, req.CategoryID)
	if err != nil {
		h.logger.Error("erro ao buscar categoria", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if category == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Categoria não encontrada"})
		return
	}

	// Verifica se o fornecedor existe, se fornecido
	if req.SupplierID != nil {
		supplier, err := h.repos.Supplier.FindByID(context.Background(), communityID, *req.SupplierID)
		if err != nil {
			h.logger.Error("erro ao buscar fornecedor", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			return
		}
		if supplier == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Fornecedor não encontrado"})
			return
		}
	}

	// Verifica se o evento existe, se fornecido
	if req.EventID != nil {
		event, err := h.repos.Event.FindByID(context.Background(), communityID, *req.EventID)
		if err != nil {
			h.logger.Error("erro ao buscar evento", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			return
		}
		if event == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
			return
		}
	}

	expense := &domain.Expense{
		CommunityID: communityID,
		UserID:      user.(*domain.User).ID,
		CategoryID:  req.CategoryID,
		SupplierID:  req.SupplierID,
		EventID:     req.EventID,
		Amount:      req.Amount,
		Date:        req.Date,
		Description: req.Description,
		Status:      req.Status,
		PaymentType: req.PaymentType,
		DueDate:     req.DueDate,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.Expense.Create(context.Background(), expense); err != nil {
		h.logger.Error("erro ao criar despesa", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar despesa"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Despesa criada com sucesso",
		"expense": expense,
	})
}

func (h *Handler) ListExpenses(c *gin.Context) {
	communityID := c.Param("communityId")

	filter := repository.NewFilterFromQuery(c)

	expenses, total, err := h.repos.Expense.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar despesas", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao listar despesas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"expenses": expenses,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

// Handlers para Receitas
func (h *Handler) AddRevenue(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	// Verifica se o usuário tem permissão
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para adicionar receitas"})
		return
	}

	var req AddRevenueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verifica se a categoria existe
	category, err := h.repos.FinancialCategory.FindByID(context.Background(), communityID, req.CategoryID)
	if err != nil {
		h.logger.Error("erro ao buscar categoria", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if category == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Categoria não encontrada"})
		return
	}

	// Verifica se o evento existe, se fornecido
	if req.EventID != nil {
		event, err := h.repos.Event.FindByID(context.Background(), communityID, *req.EventID)
		if err != nil {
			h.logger.Error("erro ao buscar evento", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			return
		}
		if event == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
			return
		}
	}

	revenue := &domain.Revenue{
		CommunityID: communityID,
		UserID:      user.(*domain.User).ID,
		CategoryID:  req.CategoryID,
		EventID:     req.EventID,
		Amount:      req.Amount,
		Date:        req.Date,
		Description: req.Description,
		Status:      req.Status,
		PaymentType: req.PaymentType,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repos.Revenue.Create(context.Background(), revenue); err != nil {
		h.logger.Error("erro ao criar receita", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar receita"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Receita criada com sucesso",
		"revenue": revenue,
	})
}

func (h *Handler) ListRevenues(c *gin.Context) {
	communityID := c.Param("communityId")

	filter := repository.NewFilterFromQuery(c)

	revenues, total, err := h.repos.Revenue.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar receitas", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao listar receitas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"revenues": revenues,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

// Handlers para Relatórios
func (h *Handler) GenerateFinancialReport(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

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

	// Verifica se o usuário tem permissão
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para gerar relatórios"})
		return
	}

	var req GenerateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	report, err := h.repos.FinancialReport.GenerateReport(context.Background(), communityID, user.(*domain.User).ID, req.StartDate, req.EndDate)
	if err != nil {
		h.logger.Error("erro ao gerar relatório", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar relatório"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Relatório gerado com sucesso",
		"report":  report,
	})
}

func (h *Handler) ListFinancialReports(c *gin.Context) {
	communityID := c.Param("communityId")

	filter := repository.NewFilterFromQuery(c)

	reports, total, err := h.repos.FinancialReport.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar relatórios", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao listar relatórios"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reports": reports,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}
