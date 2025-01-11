package handler

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AddMemberRequest struct {
	UserID           string    `json:"user_id" binding:"required,uuid"`
	Name             string    `json:"name" binding:"required,min=3"`
	Email            string    `json:"email" binding:"required,email"`
	Phone            string    `json:"phone"`
	Role             string    `json:"role" binding:"required,oneof=member admin"`
	Type             string    `json:"type" binding:"required,oneof=regular visitor transferred"`
	Status           string    `json:"status" binding:"required,oneof=pending active inactive blocked"`
	JoinDate         time.Time `json:"join_date" binding:"required"`
	BirthDate        time.Time `json:"birth_date"`
	Gender           string    `json:"gender"`
	MaritalStatus    string    `json:"marital_status"`
	Occupation       string    `json:"occupation"`
	Address          string    `json:"address"`
	City             string    `json:"city"`
	State            string    `json:"state"`
	Country          string    `json:"country"`
	ZipCode          string    `json:"zip_code"`
	Notes            string    `json:"notes"`
	EmergencyContact string    `json:"emergency_contact"`
	EmergencyPhone   string    `json:"emergency_phone"`

	// Campos de ministério
	Ministry          string    `json:"ministry"`
	MinistryRole      string    `json:"ministry_role"`
	MinistryStartDate time.Time `json:"ministry_start_date"`
	IsVolunteer       bool      `json:"is_volunteer"`
	Skills            []string  `json:"skills"`
	Interests         []string  `json:"interests"`

	// Campos de família
	FamilyRole string `json:"family_role"`

	// Campos de batismo e membresia
	BaptismDate     time.Time `json:"baptism_date"`
	BaptismLocation string    `json:"baptism_location"`
	MembershipDate  time.Time `json:"membership_date"`
	MembershipType  string    `json:"membership_type"`
	PreviousChurch  string    `json:"previous_church"`
	TransferredFrom string    `json:"transferred_from"`
	TransferredTo   string    `json:"transferred_to"`
	TransferDate    time.Time `json:"transfer_date"`

	// Campos de comunicação
	NotifyByEmail            bool `json:"notify_by_email"`
	NotifyByPhone            bool `json:"notify_by_phone"`
	NotifyByWhatsApp         bool `json:"notify_by_whatsapp"`
	AllowPhotos              bool `json:"allow_photos"`
	IsSubscribedToNewsletter bool `json:"is_subscribed_to_newsletter"`
}

type UpdateMemberRequest struct {
	Name             string    `json:"name" binding:"required,min=3"`
	Email            string    `json:"email" binding:"required,email"`
	Phone            string    `json:"phone"`
	Role             string    `json:"role" binding:"required,oneof=member leader admin"`
	Type             string    `json:"type" binding:"required,oneof=regular visitor transferred"`
	Status           string    `json:"status" binding:"required,oneof=pending active inactive blocked"`
	JoinDate         time.Time `json:"join_date" binding:"required"`
	BirthDate        time.Time `json:"birth_date" time_format:"2006-01-02"`
	Gender           string    `json:"gender"`
	MaritalStatus    string    `json:"marital_status"`
	Occupation       string    `json:"occupation"`
	Address          string    `json:"address"`
	City             string    `json:"city"`
	State            string    `json:"state"`
	Country          string    `json:"country"`
	ZipCode          string    `json:"zip_code" binding:"omitempty"`
	Notes            string    `json:"notes"`
	EmergencyContact string    `json:"emergency_contact" binding:"omitempty"`
	EmergencyPhone   string    `json:"emergency_phone" binding:"omitempty"`

	// Campos de ministério
	Ministry          string    `json:"ministry"`
	MinistryRole      string    `json:"ministry_role"`
	MinistryStartDate time.Time `json:"ministry_start_date"`
	IsVolunteer       bool      `json:"is_volunteer"`
	Skills            []string  `json:"skills"`
	Interests         []string  `json:"interests"`

	// Campos de família
	FamilyID   string `json:"family_id"`
	FamilyRole string `json:"family_role"`

	// Campos de batismo e membresia
	BaptismDate     time.Time `json:"baptism_date"`
	BaptismLocation string    `json:"baptism_location"`
	MembershipDate  time.Time `json:"membership_date"`
	MembershipType  string    `json:"membership_type"`
	PreviousChurch  string    `json:"previous_church"`
	TransferredFrom string    `json:"transferred_from"`
	TransferredTo   string    `json:"transferred_to"`
	TransferDate    time.Time `json:"transfer_date"`

	// Campos de comunicação
	NotifyByEmail            bool `json:"notify_by_email"`
	NotifyByPhone            bool `json:"notify_by_phone"`
	NotifyByWhatsApp         bool `json:"notify_by_whatsapp"`
	AllowPhotos              bool `json:"allow_photos"`
	IsSubscribedToNewsletter bool `json:"is_subscribed_to_newsletter"`
}

func (h *Handler) AddMember(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário tem permissão para adicionar membros
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para adicionar membros"})
		return
	}

	var req AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verifica se o usuário existe
	userToAdd, err := h.repos.User.FindByID(context.Background(), req.UserID)
	if err != nil {
		h.logger.Error("erro ao buscar usuário", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if userToAdd == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Verifica se o email já está em uso na comunidade
	existingMember, err := h.repos.Member.FindByEmail(context.Background(), communityID, req.Email)
	if err != nil {
		h.logger.Error("erro ao verificar email", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if existingMember != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email já está em uso nesta comunidade"})
		return
	}

	// Cria o membro
	memberID := uuid.New().String()
	h.logger.Debug("criando membro",
		zap.String("member_id", memberID),
		zap.String("community_id", communityID),
		zap.String("user_id", req.UserID))

	member := &domain.Member{
		CommunityID:      communityID,
		UserID:           req.UserID,
		Name:             req.Name,
		Email:            req.Email,
		Phone:            req.Phone,
		Role:             req.Role,
		Type:             req.Type,
		Status:           req.Status,
		JoinDate:         req.JoinDate,
		BirthDate:        req.BirthDate,
		Gender:           req.Gender,
		MaritalStatus:    req.MaritalStatus,
		Occupation:       req.Occupation,
		Address:          req.Address,
		City:             req.City,
		State:            req.State,
		Country:          req.Country,
		ZipCode:          req.ZipCode,
		Notes:            req.Notes,
		EmergencyContact: req.EmergencyContact,
		EmergencyPhone:   req.EmergencyPhone,

		// Campos de ministério
		Ministry:          req.Ministry,
		MinistryRole:      req.MinistryRole,
		MinistryStartDate: &req.MinistryStartDate,
		IsVolunteer:       req.IsVolunteer,
		Skills:            req.Skills,
		Interests:         req.Interests,

		// Campos de família
		FamilyRole: req.FamilyRole,

		// Campos de batismo e membresia
		BaptismDate:     &req.BaptismDate,
		BaptismLocation: req.BaptismLocation,
		MembershipDate:  &req.MembershipDate,
		MembershipType:  req.MembershipType,
		PreviousChurch:  req.PreviousChurch,
		TransferredFrom: req.TransferredFrom,
		TransferredTo:   req.TransferredTo,
		TransferDate:    &req.TransferDate,

		// Campos de comunicação
		NotifyByEmail:            req.NotifyByEmail,
		NotifyByPhone:            req.NotifyByPhone,
		NotifyByWhatsApp:         req.NotifyByWhatsApp,
		AllowPhotos:              req.AllowPhotos,
		IsSubscribedToNewsletter: req.IsSubscribedToNewsletter,

		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	h.logger.Debug("dados do membro",
		zap.Any("member", member))

	if err := h.repos.Member.Create(context.Background(), member); err != nil {
		h.logger.Error("erro ao criar membro",
			zap.Error(err),
			zap.String("community_id", communityID),
			zap.String("member_id", member.ID), // Alterado para member.ID
			zap.String("member_name", member.Name),
			zap.String("member_email", member.Email),
			zap.Any("member", member)) // Adicionado log do objeto completo
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Membro adicionado com sucesso",
		"member":  member,
	})
}

func (h *Handler) ListMembers(c *gin.Context) {
	communityID := c.Param("communityId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Obtém os parâmetros de paginação e busca
	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
		Search:  c.Query("search"),
	}

	if pageQuery := c.Query("page"); pageQuery != "" {
		if _, err := fmt.Sscanf(pageQuery, "%d", &filter.Page); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Página inválida"})
			return
		}
	}
	if perPageQuery := c.Query("per_page"); perPageQuery != "" {
		if _, err := fmt.Sscanf(perPageQuery, "%d", &filter.PerPage); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Limite inválido"})
			return
		}
	}

	// Lista os membros
	members, total, err := h.repos.Member.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar membros", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"members": members,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

func (h *Handler) GetMember(c *gin.Context) {
	communityID := c.Param("communityId")
	memberID := c.Param("memberId")

	// Busca o membro
	member, err := h.repos.Member.FindByID(context.Background(), communityID, memberID)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"member": member,
	})
}

func (h *Handler) UpdateMember(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	memberID := c.Param("memberId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário tem permissão para editar membros
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar membros"})
		return
	}

	// Busca o membro
	member, err := h.repos.Member.FindByID(context.Background(), communityID, memberID)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
		return
	}

	var req UpdateMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Atualiza o membro
	member.Name = req.Name
	member.Email = req.Email
	member.Phone = req.Phone
	member.Role = req.Role
	member.Type = req.Type
	member.Status = req.Status
	member.JoinDate = req.JoinDate

	// Ajuste para data de nascimento
	if !req.BirthDate.IsZero() {
		member.BirthDate = req.BirthDate
	}

	member.Gender = req.Gender
	member.MaritalStatus = req.MaritalStatus
	member.Occupation = req.Occupation
	member.Address = req.Address
	member.City = req.City
	member.State = req.State
	member.Country = req.Country
	member.ZipCode = req.ZipCode
	member.Notes = req.Notes
	member.EmergencyContact = req.EmergencyContact
	member.EmergencyPhone = req.EmergencyPhone

	// Campos de ministério
	member.Ministry = req.Ministry
	member.MinistryRole = req.MinistryRole
	if !req.MinistryStartDate.IsZero() {
		member.MinistryStartDate = &req.MinistryStartDate
	}
	member.IsVolunteer = req.IsVolunteer
	member.Skills = req.Skills
	member.Interests = req.Interests

	// Campos de família
	if req.FamilyID != "" && req.FamilyRole != "" {
		// Se o membro já está em uma família, remove ele primeiro
		if member.FamilyID != nil && *member.FamilyID != "" {
			if err := h.repos.Family.RemoveMember(context.Background(), *member.FamilyID, member.ID); err != nil {
				h.logger.Error("erro ao remover membro da família anterior", zap.Error(err))
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
				return
			}
		}

		// Adiciona o membro à nova família
		familyMember := &domain.FamilyMember{
			FamilyID: req.FamilyID,
			MemberID: member.ID,
			Role:     req.FamilyRole,
		}

		if err := h.repos.Family.AddMember(context.Background(), familyMember); err != nil {
			h.logger.Error("erro ao adicionar membro à família", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			return
		}

		newFamilyID := req.FamilyID
		member.FamilyID = &newFamilyID
		member.FamilyRole = req.FamilyRole
	} else if req.FamilyID == "" && member.FamilyID != nil {
		// Se o membro está sendo removido de uma família
		if err := h.repos.Family.RemoveMember(context.Background(), *member.FamilyID, member.ID); err != nil {
			h.logger.Error("erro ao remover membro da família", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			return
		}

		member.FamilyID = nil
		member.FamilyRole = ""
	}

	// Campos de batismo e membresia
	if !req.BaptismDate.IsZero() {
		member.BaptismDate = &req.BaptismDate
	}
	member.BaptismLocation = req.BaptismLocation
	if !req.MembershipDate.IsZero() {
		member.MembershipDate = &req.MembershipDate
	}
	member.MembershipType = req.MembershipType
	member.PreviousChurch = req.PreviousChurch
	member.TransferredFrom = req.TransferredFrom
	member.TransferredTo = req.TransferredTo
	if !req.TransferDate.IsZero() {
		member.TransferDate = &req.TransferDate
	}

	// Campos de comunicação
	member.NotifyByEmail = req.NotifyByEmail
	member.NotifyByPhone = req.NotifyByPhone
	member.NotifyByWhatsApp = req.NotifyByWhatsApp
	member.AllowPhotos = req.AllowPhotos
	member.IsSubscribedToNewsletter = req.IsSubscribedToNewsletter

	member.UpdatedAt = time.Now()

	if err := h.repos.Member.Update(context.Background(), member); err != nil {
		h.logger.Error("erro ao atualizar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Membro atualizado com sucesso",
		"member":  member,
	})
}

func (h *Handler) RemoveMember(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	memberID := c.Param("memberId")

	// Verifica se a comunidade existe
	community, err := h.repos.Community.FindByID(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao buscar comunidade", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if community == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comunidade não encontrada"})
		return
	}

	// Verifica se o usuário tem permissão para remover membros
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para remover membros"})
		return
	}

	// Remove o membro
	if err := h.repos.Member.Delete(context.Background(), communityID, memberID); err != nil {
		h.logger.Error("erro ao remover membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Membro removido com sucesso",
	})
}

// UploadMemberPhoto faz o upload da foto do membro
func (h *Handler) UploadMemberPhoto(c *gin.Context) {
	communityID := c.Param("communityId")
	memberID := c.Param("memberId")

	// Verifica se o membro existe
	member, err := h.repos.Member.FindByID(context.Background(), communityID, memberID)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
		return
	}

	// Recebe o arquivo
	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Arquivo não encontrado", "details": err.Error()})
		return
	}

	// Verifica o tipo do arquivo
	if !strings.HasPrefix(file.Header.Get("Content-Type"), "image/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Arquivo deve ser uma imagem"})
		return
	}

	// Gera um nome único para o arquivo
	filename := fmt.Sprintf("members/%s/%s%s",
		communityID,
		uuid.New().String(),
		filepath.Ext(file.Filename))

	// Cria o diretório se não existir
	uploadDir := "uploads/members/" + communityID
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		h.logger.Error("erro ao criar diretório", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar arquivo"})
		return
	}

	// Salva o arquivo
	if err := c.SaveUploadedFile(file, "uploads/"+filename); err != nil {
		h.logger.Error("erro ao salvar arquivo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar arquivo"})
		return
	}

	// Remove a foto antiga se existir
	if member.Photo != "" {
		oldPath := "uploads/" + member.Photo
		if err := os.Remove(oldPath); err != nil && !os.IsNotExist(err) {
			h.logger.Error("erro ao remover foto antiga", zap.Error(err))
		}
	}

	// Atualiza o caminho da foto no banco
	member.Photo = filename
	member.UpdatedAt = time.Now()

	if err := h.repos.Member.Update(context.Background(), member); err != nil {
		h.logger.Error("erro ao atualizar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar membro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Foto atualizada com sucesso",
		"photo":   filename,
	})
}

// GetMemberFamily retorna a família do membro
func (h *Handler) GetMemberFamily(c *gin.Context) {
	communityID := c.Param("communityId")
	memberID := c.Param("memberId")

	// Verifica se o membro existe
	member, err := h.repos.Member.FindByID(context.Background(), communityID, memberID)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
		return
	}

	// Busca a família do membro
	familyMember, err := h.repos.Family.FindByMemberID(context.Background(), memberID)
	if err != nil {
		h.logger.Error("erro ao buscar família do membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if familyMember == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não pertence a nenhuma família"})
		return
	}

	c.JSON(http.StatusOK, familyMember)
}
