package repository

import (
	"context"
	"errors"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// UserRepository é a interface que define os métodos do repositório de usuários
type UserRepository interface {
	Repository
	Create(ctx context.Context, user *domain.User) error
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id string) error
	FindByID(ctx context.Context, id string) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	FindByCommunity(ctx context.Context, communityID string, filter *Filter) ([]*domain.User, int64, error)
	List(ctx context.Context, filter *Filter) ([]*domain.User, int64, error)
	SaveResetToken(ctx context.Context, userID string, token string, expiresAt time.Time) error
	FindByResetToken(ctx context.Context, token string) (*domain.User, error)
	UpdatePassword(ctx context.Context, userID string, hashedPassword string) error
}

// userRepository é a implementação do UserRepository
type userRepository struct {
	BaseRepository
}

// NewUserRepository cria uma nova instância de UserRepository
func NewUserRepository(db *gorm.DB, logger *zap.Logger) UserRepository {
	return &userRepository{
		BaseRepository: NewBaseRepository(db, logger),
	}
}

// Create cria um novo usuário
func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	return r.GetDB().WithContext(ctx).Create(user).Error
}

// Update atualiza um usuário existente
func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	return r.GetDB().WithContext(ctx).Save(user).Error
}

// Delete remove um usuário
func (r *userRepository) Delete(ctx context.Context, id string) error {
	return r.GetDB().WithContext(ctx).Delete(&domain.User{}, "id = ?", id).Error
}

// FindByID busca um usuário pelo ID
func (r *userRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User
	if err := r.GetDB().WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByEmail busca um usuário pelo email
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	if err := r.GetDB().WithContext(ctx).First(&user, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByCommunity busca usuários por comunidade
func (r *userRepository) FindByCommunity(ctx context.Context, communityID string, filter *Filter) ([]*domain.User, int64, error) {
	var users []*domain.User
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.User{}).
		Joins("JOIN members ON members.user_id = users.id").
		Where("members.community_id = ?", communityID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// List lista todos os usuários
func (r *userRepository) List(ctx context.Context, filter *Filter) ([]*domain.User, int64, error) {
	var users []*domain.User
	var total int64

	query := r.GetDB().WithContext(ctx).Model(&domain.User{})

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := ApplyFilter(query, filter).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *userRepository) SaveResetToken(ctx context.Context, userID string, token string, expiresAt time.Time) error {
	return r.GetDB().WithContext(ctx).Model(&domain.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"reset_token":        token,
			"reset_token_expiry": expiresAt,
			"updated_at":         time.Now(),
		}).Error
}

func (r *userRepository) FindByResetToken(ctx context.Context, token string) (*domain.User, error) {
	var user domain.User
	if err := r.GetDB().WithContext(ctx).
		Where("reset_token = ? AND reset_token_expiry > ?", token, time.Now()).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) UpdatePassword(ctx context.Context, userID string, hashedPassword string) error {
	return r.GetDB().WithContext(ctx).Model(&domain.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"password":           hashedPassword,
			"reset_token":        nil,
			"reset_token_expiry": nil,
			"updated_at":         time.Now(),
		}).Error
}
