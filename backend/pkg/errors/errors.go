package errors

import (
	"errors"
	"fmt"
	"net/http"
)

// Error representa um erro da aplicação
type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Err     error  `json:"-"`
}

// Error retorna a mensagem de erro
func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

// Unwrap retorna o erro original
func (e *Error) Unwrap() error {
	return e.Err
}

// New cria um novo erro
func New(code int, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
	}
}

// Wrap envolve um erro existente
func Wrap(err error, code int, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// Is verifica se o erro é do tipo Error
func Is(err error) bool {
	var e *Error
	return errors.As(err, &e)
}

// GetCode retorna o código do erro
func GetCode(err error) int {
	var e *Error
	if errors.As(err, &e) {
		return e.Code
	}
	return http.StatusInternalServerError
}

// GetMessage retorna a mensagem do erro
func GetMessage(err error) string {
	var e *Error
	if errors.As(err, &e) {
		return e.Message
	}
	return err.Error()
}

// Common errors
var (
	ErrInvalidInput = New(http.StatusBadRequest, "entrada inválida")
	ErrNotFound     = New(http.StatusNotFound, "recurso não encontrado")
	ErrUnauthorized = New(http.StatusUnauthorized, "não autorizado")
	ErrForbidden    = New(http.StatusForbidden, "acesso negado")
	ErrConflict     = New(http.StatusConflict, "conflito")
	ErrInternal     = New(http.StatusInternalServerError, "erro interno do servidor")
)
