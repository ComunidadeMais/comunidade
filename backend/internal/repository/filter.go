package repository

import (
	"gorm.io/gorm"
)

type Filter struct {
	Page     int    `json:"page" form:"page"`
	PerPage  int    `json:"per_page" form:"per_page"`
	OrderBy  string `json:"order_by" form:"order_by"`
	OrderDir string `json:"order_dir" form:"order_dir"`
	Search   string `json:"search" form:"search"`

	// Condições personalizadas
	conditions []condition
}

type condition struct {
	query interface{}
	args  []interface{}
}

// Validate ajusta os valores de Page e PerPage para garantir que sejam válidos
func (f *Filter) Validate() {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.PerPage < 1 {
		f.PerPage = 10
	}
	if f.PerPage > 100 {
		f.PerPage = 100
	}
}

// AddCondition adiciona uma condição personalizada ao filtro
func (f *Filter) AddCondition(query interface{}, args ...interface{}) {
	if f.conditions == nil {
		f.conditions = make([]condition, 0)
	}
	f.conditions = append(f.conditions, condition{query: query, args: args})
}

// ApplyFilter aplica o filtro à query do GORM
func ApplyFilter(query *gorm.DB, filter *Filter) *gorm.DB {
	if filter == nil {
		return query
	}

	// Valida os valores do filtro
	filter.Validate()

	// Aplica a busca
	if filter.Search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	// Aplica as condições personalizadas
	for _, cond := range filter.conditions {
		query = query.Where(cond.query, cond.args...)
	}

	// Aplica a ordenação
	if filter.OrderBy != "" {
		if filter.OrderDir != "desc" {
			filter.OrderDir = "asc"
		}
		query = query.Order(filter.OrderBy + " " + filter.OrderDir)
	} else {
		query = query.Order("created_at desc")
	}

	// Aplica a paginação
	offset := (filter.Page - 1) * filter.PerPage
	query = query.Offset(offset).Limit(filter.PerPage)

	return query
}
