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
	Name         string `json:"name" binding:"required"`
	CNPJ         string `json:"cnpj" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	Number       string `json:"number"`
	Neighborhood string `json:"neighborhood"`
	City         string `json:"city"`
	State        string `json:"state"`
	ZipCode      string `json:"zip_code"`
	Notes        string `json:"notes"`
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

type UpdateFinancialCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Type        string `json:"type" binding:"required,oneof=expense revenue"`
	Description string `json:"description"`
}

type UpdateSupplierRequest struct {
	Name         string `json:"name" binding:"required"`
	CNPJ         string `json:"cnpj" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	Number       string `json:"number"`
	Neighborhood string `json:"neighborhood"`
	City         string `json:"city"`
	State        string `json:"state"`
	ZipCode      string `json:"zip_code"`
	Notes        string `json:"notes"`
}

type UpdateExpenseRequest struct {
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

type UpdateRevenueRequest struct {
	CategoryID  string    `json:"category_id" binding:"required,uuid"`
	EventID     *string   `json:"event_id" binding:"omitempty,uuid"`
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Date        time.Time `json:"date" binding:"required"`
	Description string    `json:"description"`
	Status      string    `json:"status" binding:"required,oneof=pending received cancelled"`
	PaymentType string    `json:"payment_type"`
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
		CommunityID:  communityID,
		UserID:       user.(*domain.User).ID,
		Name:         req.Name,
		CNPJ:         req.CNPJ,
		Email:        req.Email,
		Phone:        req.Phone,
		Address:      req.Address,
		Number:       req.Number,
		Neighborhood: req.Neighborhood,
		City:         req.City,
		State:        req.State,
		ZipCode:      req.ZipCode,
		Notes:        req.Notes,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
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

// UpdateFinancialCategory atualiza uma categoria financeira
func (h *Handler) UpdateFinancialCategory(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	categoryID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para atualizar categorias financeiras"})
		return
	}

	// Verifica se a categoria existe
	category, err := h.repos.FinancialCategory.FindByID(context.Background(), communityID, categoryID)
	if err != nil {
		h.logger.Error("erro ao buscar categoria", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if category == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Categoria não encontrada"})
		return
	}

	var req UpdateFinancialCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	category.Name = req.Name
	category.Type = req.Type
	category.Description = req.Description

	if err := h.repos.FinancialCategory.Update(context.Background(), category); err != nil {
		h.logger.Error("erro ao atualizar categoria", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar categoria"})
		return
	}

	c.JSON(http.StatusOK, category)
}

// DeleteFinancialCategory exclui uma categoria financeira
func (h *Handler) DeleteFinancialCategory(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	categoryID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para excluir categorias financeiras"})
		return
	}

	// Verifica se a categoria existe
	category, err := h.repos.FinancialCategory.FindByID(context.Background(), communityID, categoryID)
	if err != nil {
		h.logger.Error("erro ao buscar categoria", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if category == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Categoria não encontrada"})
		return
	}

	// Verifica se a categoria está sendo usada em receitas
	revenuesCount, err := h.repos.Revenue.CountByCategory(context.Background(), communityID, categoryID)
	if err != nil {
		h.logger.Error("erro ao verificar uso da categoria em receitas", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Verifica se a categoria está sendo usada em despesas
	expensesCount, err := h.repos.Expense.CountByCategory(context.Background(), communityID, categoryID)
	if err != nil {
		h.logger.Error("erro ao verificar uso da categoria em despesas", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Se a categoria estiver sendo usada, retorna erro
	if revenuesCount > 0 || expensesCount > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Não é possível excluir esta categoria pois ela está sendo usada em receitas ou despesas",
			"details": gin.H{
				"revenues_count": revenuesCount,
				"expenses_count": expensesCount,
			},
		})
		return
	}

	if err := h.repos.FinancialCategory.Delete(context.Background(), communityID, categoryID); err != nil {
		h.logger.Error("erro ao excluir categoria", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir categoria"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// UpdateSupplier atualiza um fornecedor
func (h *Handler) UpdateSupplier(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	supplierID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para atualizar fornecedores"})
		return
	}

	// Verifica se o fornecedor existe
	supplier, err := h.repos.Supplier.FindByID(context.Background(), communityID, supplierID)
	if err != nil {
		h.logger.Error("erro ao buscar fornecedor", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if supplier == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fornecedor não encontrado"})
		return
	}

	var req UpdateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	supplier.Name = req.Name
	supplier.CNPJ = req.CNPJ
	supplier.Email = req.Email
	supplier.Phone = req.Phone
	supplier.Address = req.Address
	supplier.Number = req.Number
	supplier.Neighborhood = req.Neighborhood
	supplier.City = req.City
	supplier.State = req.State
	supplier.ZipCode = req.ZipCode
	supplier.Notes = req.Notes

	if err := h.repos.Supplier.Update(context.Background(), supplier); err != nil {
		h.logger.Error("erro ao atualizar fornecedor", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar fornecedor"})
		return
	}

	c.JSON(http.StatusOK, supplier)
}

// DeleteSupplier exclui um fornecedor
func (h *Handler) DeleteSupplier(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	supplierID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para excluir fornecedores"})
		return
	}

	// Verifica se o fornecedor existe
	supplier, err := h.repos.Supplier.FindByID(context.Background(), communityID, supplierID)
	if err != nil {
		h.logger.Error("erro ao buscar fornecedor", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if supplier == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fornecedor não encontrado"})
		return
	}

	// Verifica se o fornecedor está sendo usado em despesas
	expensesCount, err := h.repos.Expense.CountBySupplier(context.Background(), communityID, supplierID)
	if err != nil {
		h.logger.Error("erro ao verificar uso do fornecedor em despesas", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	// Se o fornecedor estiver sendo usado, retorna erro
	if expensesCount > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Não é possível excluir este fornecedor pois ele está sendo usado em despesas",
			"details": gin.H{
				"expenses_count": expensesCount,
			},
		})
		return
	}

	if err := h.repos.Supplier.Delete(context.Background(), communityID, supplierID); err != nil {
		h.logger.Error("erro ao excluir fornecedor", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir fornecedor"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// UpdateExpense atualiza uma despesa
func (h *Handler) UpdateExpense(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	expenseID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para atualizar despesas"})
		return
	}

	// Verifica se a despesa existe
	expense, err := h.repos.Expense.FindByID(context.Background(), communityID, expenseID)
	if err != nil {
		h.logger.Error("erro ao buscar despesa", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if expense == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Despesa não encontrada"})
		return
	}

	var req UpdateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	expense.CategoryID = req.CategoryID
	expense.SupplierID = req.SupplierID
	expense.EventID = req.EventID
	expense.Amount = req.Amount
	expense.Date = req.Date
	expense.Description = req.Description
	expense.Status = req.Status
	expense.PaymentType = req.PaymentType
	expense.DueDate = req.DueDate

	if err := h.repos.Expense.Update(context.Background(), expense); err != nil {
		h.logger.Error("erro ao atualizar despesa", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar despesa"})
		return
	}

	c.JSON(http.StatusOK, expense)
}

// DeleteExpense exclui uma despesa
func (h *Handler) DeleteExpense(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	expenseID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para excluir despesas"})
		return
	}

	// Verifica se a despesa existe
	expense, err := h.repos.Expense.FindByID(context.Background(), communityID, expenseID)
	if err != nil {
		h.logger.Error("erro ao buscar despesa", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if expense == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Despesa não encontrada"})
		return
	}

	if err := h.repos.Expense.Delete(context.Background(), communityID, expenseID); err != nil {
		h.logger.Error("erro ao excluir despesa", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir despesa"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// UpdateRevenue atualiza uma receita
func (h *Handler) UpdateRevenue(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	revenueID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para atualizar receitas"})
		return
	}

	// Verifica se a receita existe
	revenue, err := h.repos.Revenue.FindByID(context.Background(), communityID, revenueID)
	if err != nil {
		h.logger.Error("erro ao buscar receita", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if revenue == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Receita não encontrada"})
		return
	}

	var req UpdateRevenueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	revenue.CategoryID = req.CategoryID
	revenue.EventID = req.EventID
	revenue.Amount = req.Amount
	revenue.Date = req.Date
	revenue.Description = req.Description
	revenue.Status = req.Status
	revenue.PaymentType = req.PaymentType

	if err := h.repos.Revenue.Update(context.Background(), revenue); err != nil {
		h.logger.Error("erro ao atualizar receita", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar receita"})
		return
	}

	c.JSON(http.StatusOK, revenue)
}

// DeleteRevenue exclui uma receita
func (h *Handler) DeleteRevenue(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	revenueID := c.Param("id")

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
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para excluir receitas"})
		return
	}

	// Verifica se a receita existe
	revenue, err := h.repos.Revenue.FindByID(context.Background(), communityID, revenueID)
	if err != nil {
		h.logger.Error("erro ao buscar receita", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if revenue == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Receita não encontrada"})
		return
	}

	if err := h.repos.Revenue.Delete(context.Background(), communityID, revenueID); err != nil {
		h.logger.Error("erro ao excluir receita", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao excluir receita"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
