package http

import (
	"github.com/comunidade/backend/internal/repository"
	"github.com/comunidade/backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

// Handler é uma interface base para todos os handlers
type Handler interface {
	GetUseCase() usecase.UseCase
}

// BaseHandler implementa a interface Handler
type BaseHandler struct {
	useCase usecase.UseCase
}

// NewBaseHandler cria uma nova instância de BaseHandler
func NewBaseHandler(useCase usecase.UseCase) BaseHandler {
	return BaseHandler{useCase: useCase}
}

// GetUseCase retorna o caso de uso
func (h BaseHandler) GetUseCase() usecase.UseCase {
	return h.useCase
}

// Response representa uma resposta HTTP padrão
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

// SendSuccess envia uma resposta de sucesso
func SendSuccess(c *gin.Context, code int, data interface{}, message string) {
	c.JSON(code, NewSuccessResponse(data, message))
}

// SendError envia uma resposta de erro
func SendError(c *gin.Context, code int, err error) {
	c.JSON(code, NewErrorResponse(err))
}

// GetFilter retorna os filtros da requisição
func GetFilter(c *gin.Context) *repository.Filter {
	filter := &repository.Filter{}
	if err := c.ShouldBindQuery(filter); err != nil {
		return &repository.Filter{
			Page:    1,
			PerPage: 10,
		}
	}
	filter.Validate()
	return filter
}
