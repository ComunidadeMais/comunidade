package usecase

import (
	"github.com/comunidade/backend/internal/repository"
)

// UseCase é uma interface base para todos os casos de uso
type UseCase interface {
	GetRepository() repository.Repository
}

// BaseUseCase implementa a interface UseCase
type BaseUseCase struct {
	repo repository.Repository
}

// NewBaseUseCase cria uma nova instância de BaseUseCase
func NewBaseUseCase(repo repository.Repository) BaseUseCase {
	return BaseUseCase{repo: repo}
}

// GetRepository retorna o repositório
func (u BaseUseCase) GetRepository() repository.Repository {
	return u.repo
}

// Response representa uma resposta padrão dos casos de uso
type Response struct {
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// NewSuccessResponse cria uma nova resposta de sucesso
func NewSuccessResponse(data interface{}, message string) Response {
	return Response{
		Data:    data,
		Message: message,
	}
}

// NewErrorResponse cria uma nova resposta de erro
func NewErrorResponse(err error) Response {
	return Response{
		Error: err.Error(),
	}
}

// PaginatedResponse representa uma resposta paginada
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

// Pagination representa os metadados de paginação
type Pagination struct {
	CurrentPage int   `json:"current_page"`
	PerPage     int   `json:"per_page"`
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
	HasPrevPage bool  `json:"has_prev_page"`
	HasNextPage bool  `json:"has_next_page"`
}

// NewPaginatedResponse cria uma nova resposta paginada
func NewPaginatedResponse(data interface{}, page, perPage int, total int64) PaginatedResponse {
	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	return PaginatedResponse{
		Data: data,
		Pagination: Pagination{
			CurrentPage: page,
			PerPage:     perPage,
			TotalItems:  total,
			TotalPages:  totalPages,
			HasPrevPage: page > 1,
			HasNextPage: page < totalPages,
		},
	}
}
