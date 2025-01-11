package usecase

import (
	"context"

	"github.com/comunidade/backend/internal/domain"
)

// TokenClaims representa as informações contidas no token JWT
type TokenClaims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
}

// AuthUseCase define os métodos necessários para autenticação
type AuthUseCase interface {
	// Login autentica um usuário e retorna um token JWT
	Login(ctx context.Context, email, password string) (string, error)

	// Register registra um novo usuário
	Register(ctx context.Context, user *domain.User) error

	// ValidateToken valida um token JWT e retorna suas claims
	ValidateToken(ctx context.Context, token string) (*TokenClaims, error)

	// GetMemberRole retorna o papel de um usuário em uma comunidade
	GetMemberRole(ctx context.Context, communityID, userID string) (*domain.Member, error)

	// GetGroupRole retorna o papel de um usuário em um grupo
	GetGroupRole(ctx context.Context, groupID, userID string) (*domain.Member, error)

	// RefreshToken atualiza um token JWT
	RefreshToken(ctx context.Context, token string) (string, error)

	// ForgotPassword inicia o processo de recuperação de senha
	ForgotPassword(ctx context.Context, email string) error

	// ResetPassword redefine a senha do usuário
	ResetPassword(ctx context.Context, token, newPassword string) error

	// VerifyEmail verifica o email do usuário
	VerifyEmail(ctx context.Context, token string) error

	// ResendVerificationEmail reenvia o email de verificação
	ResendVerificationEmail(ctx context.Context, email string) error

	// ChangePassword altera a senha do usuário
	ChangePassword(ctx context.Context, userID, currentPassword, newPassword string) error

	// UpdateProfile atualiza o perfil do usuário
	UpdateProfile(ctx context.Context, userID string, user *domain.User) error
}
