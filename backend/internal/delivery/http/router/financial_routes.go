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
		}

		// Rotas para Fornecedores
		suppliers := financial.Group("/suppliers")
		{
			suppliers.POST("", h.AddSupplier)
			suppliers.GET("", h.ListSuppliers)
		}

		// Rotas para Despesas
		expenses := financial.Group("/expenses")
		{
			expenses.POST("", h.AddExpense)
			expenses.GET("", h.ListExpenses)
		}

		// Rotas para Receitas
		revenues := financial.Group("/revenues")
		{
			revenues.POST("", h.AddRevenue)
			revenues.GET("", h.ListRevenues)
		}

		// Rotas para Relatórios
		reports := financial.Group("/reports")
		{
			reports.POST("", h.GenerateFinancialReport)
			reports.GET("", h.ListFinancialReports)
		}
	}
}
