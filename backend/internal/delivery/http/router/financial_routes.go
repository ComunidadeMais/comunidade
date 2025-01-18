package router

import "github.com/gin-gonic/gin"

func InitFinancialRoutes(router *gin.RouterGroup, h RouteHandler) {
	financial := router.Group("/:communityId/financial")
	{
		// Rotas para Categorias Financeiras
		categories := financial.Group("/categories")
		{
			categories.POST("", h.AddFinancialCategory)
			categories.GET("", h.ListFinancialCategories)
			categories.PUT("/:id", h.UpdateFinancialCategory)
			categories.DELETE("/:id", h.DeleteFinancialCategory)
		}

		// Rotas para Fornecedores
		suppliers := financial.Group("/suppliers")
		{
			suppliers.POST("", h.AddSupplier)
			suppliers.GET("", h.ListSuppliers)
			suppliers.PUT("/:id", h.UpdateSupplier)
			suppliers.DELETE("/:id", h.DeleteSupplier)
		}

		// Rotas para Despesas
		expenses := financial.Group("/expenses")
		{
			expenses.POST("", h.AddExpense)
			expenses.GET("", h.ListExpenses)
			expenses.PUT("/:id", h.UpdateExpense)
			expenses.DELETE("/:id", h.DeleteExpense)
		}

		// Rotas para Receitas
		revenues := financial.Group("/revenues")
		{
			revenues.POST("", h.AddRevenue)
			revenues.GET("", h.ListRevenues)
			revenues.PUT("/:id", h.UpdateRevenue)
			revenues.DELETE("/:id", h.DeleteRevenue)
		}

		// Rotas para Relatórios
		reports := financial.Group("/reports")
		{
			reports.POST("", h.GenerateFinancialReport)
			reports.GET("", h.ListFinancialReports)
		}
	}
}
