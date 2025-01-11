package validator

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/comunidade/backend/pkg/errors"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

	// Registra função para obter o nome do campo da tag json
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

// Validate valida uma estrutura
func Validate(i interface{}) error {
	if err := validate.Struct(i); err != nil {
		var errs []string
		for _, err := range err.(validator.ValidationErrors) {
			errs = append(errs, formatError(err))
		}
		return errors.Wrap(fmt.Errorf(strings.Join(errs, "; ")), 400, "erro de validação")
	}
	return nil
}

// formatError formata um erro de validação
func formatError(err validator.FieldError) string {
	field := err.Field()
	tag := err.Tag()
	param := err.Param()

	switch tag {
	case "required":
		return fmt.Sprintf("o campo %s é obrigatório", field)
	case "email":
		return fmt.Sprintf("o campo %s deve ser um e-mail válido", field)
	case "min":
		return fmt.Sprintf("o campo %s deve ter no mínimo %s caracteres", field, param)
	case "max":
		return fmt.Sprintf("o campo %s deve ter no máximo %s caracteres", field, param)
	case "len":
		return fmt.Sprintf("o campo %s deve ter exatamente %s caracteres", field, param)
	case "uuid":
		return fmt.Sprintf("o campo %s deve ser um UUID válido", field)
	case "url":
		return fmt.Sprintf("o campo %s deve ser uma URL válida", field)
	case "oneof":
		return fmt.Sprintf("o campo %s deve ser um dos seguintes valores: %s", field, param)
	default:
		return fmt.Sprintf("o campo %s é inválido", field)
	}
}

// Custom validators

// ValidatePassword valida uma senha
func ValidatePassword(password string) error {
	if len(password) < 8 {
		return errors.New(400, "a senha deve ter no mínimo 8 caracteres")
	}

	var (
		hasUpper   bool
		hasLower   bool
		hasNumber  bool
		hasSpecial bool
	)

	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		case strings.ContainsRune("!@#$%^&*()_+-=[]{}|;:,.<>?", char):
			hasSpecial = true
		}
	}

	if !hasUpper {
		return errors.New(400, "a senha deve conter pelo menos uma letra maiúscula")
	}
	if !hasLower {
		return errors.New(400, "a senha deve conter pelo menos uma letra minúscula")
	}
	if !hasNumber {
		return errors.New(400, "a senha deve conter pelo menos um número")
	}
	if !hasSpecial {
		return errors.New(400, "a senha deve conter pelo menos um caractere especial")
	}

	return nil
}

// ValidatePhone valida um número de telefone
func ValidatePhone(phone string) error {
	phone = strings.ReplaceAll(phone, " ", "")
	phone = strings.ReplaceAll(phone, "-", "")
	phone = strings.ReplaceAll(phone, "(", "")
	phone = strings.ReplaceAll(phone, ")", "")

	if len(phone) < 10 || len(phone) > 11 {
		return errors.New(400, "o telefone deve ter entre 10 e 11 dígitos")
	}

	for _, char := range phone {
		if char < '0' || char > '9' {
			return errors.New(400, "o telefone deve conter apenas números")
		}
	}

	return nil
}

// ValidateCPF valida um CPF
func ValidateCPF(cpf string) error {
	cpf = strings.ReplaceAll(cpf, ".", "")
	cpf = strings.ReplaceAll(cpf, "-", "")

	if len(cpf) != 11 {
		return errors.New(400, "o CPF deve ter 11 dígitos")
	}

	for _, char := range cpf {
		if char < '0' || char > '9' {
			return errors.New(400, "o CPF deve conter apenas números")
		}
	}

	var sum int
	for i := 0; i < 9; i++ {
		sum += int(cpf[i]-'0') * (10 - i)
	}

	remainder := sum % 11
	if remainder < 2 {
		if cpf[9] != '0' {
			return errors.New(400, "CPF inválido")
		}
	} else {
		if cpf[9]-'0' != byte(11-remainder) {
			return errors.New(400, "CPF inválido")
		}
	}

	sum = 0
	for i := 0; i < 10; i++ {
		sum += int(cpf[i]-'0') * (11 - i)
	}

	remainder = sum % 11
	if remainder < 2 {
		if cpf[10] != '0' {
			return errors.New(400, "CPF inválido")
		}
	} else {
		if cpf[10]-'0' != byte(11-remainder) {
			return errors.New(400, "CPF inválido")
		}
	}

	return nil
}
