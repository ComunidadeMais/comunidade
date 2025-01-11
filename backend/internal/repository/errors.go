package repository

import "errors"

var (
	// ErrNotFound é retornado quando um registro não é encontrado
	ErrNotFound = errors.New("record not found")
)
