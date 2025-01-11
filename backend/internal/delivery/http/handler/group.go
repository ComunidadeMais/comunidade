package handler

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CreateGroupRequest struct {
	Name        string    `json:"name" binding:"required,min=3"`
	Description string    `json:"description" binding:"required"`
	Type        string    `json:"type" binding:"required,oneof=cell small_group ministry department committee other"`
	Category    string    `json:"category"`
	Status      string    `json:"status" binding:"required,oneof=active inactive archived"`
	Visibility  string    `json:"visibility" binding:"required,oneof=public private hidden"`
	Location    string    `json:"location"`
	MeetingDay  string    `json:"meeting_day"`
	MeetingTime string    `json:"meeting_time"`
	Frequency   string    `json:"frequency" binding:"required,oneof=weekly biweekly monthly"`
	MaxMembers  int       `json:"max_members"`
	MinAge      int       `json:"min_age"`
	MaxAge      int       `json:"max_age"`
	Gender      string    `json:"gender" binding:"omitempty,oneof=male female"`
	StartDate   time.Time `json:"start_date"`
	Tags        []string  `json:"tags"`
	LeaderID    *string   `json:"leader_id"`
	CoLeaderID  *string   `json:"co_leader_id"`
	MemberCount int       `json:"member_count"`
	// Configurações
	AllowGuests         *bool `json:"allow_guests"`
	RequireApproval     *bool `json:"require_approval"`
	TrackAttendance     *bool `json:"track_attendance"`
	AllowSelfJoin       *bool `json:"allow_self_join"`
	NotifyOnJoinRequest *bool `json:"notify_on_join_request"`
	NotifyOnNewMember   *bool `json:"notify_on_new_member"`
}

type UpdateGroupRequest struct {
	Name        string     `json:"name" binding:"required,min=3"`
	Description string     `json:"description" binding:"required"`
	Type        string     `json:"type" binding:"required,oneof=cell small_group ministry department committee other"`
	Category    string     `json:"category"`
	Status      string     `json:"status" binding:"required,oneof=active inactive archived"`
	Visibility  string     `json:"visibility" binding:"required,oneof=public private hidden"`
	Location    string     `json:"location"`
	MeetingDay  string     `json:"meeting_day"`
	MeetingTime string     `json:"meeting_time"`
	Frequency   string     `json:"frequency" binding:"required,oneof=weekly biweekly monthly"`
	MaxMembers  int        `json:"max_members"`
	MinAge      int        `json:"min_age"`
	MaxAge      int        `json:"max_age"`
	Gender      string     `json:"gender" binding:"omitempty,oneof=male female"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     *time.Time `json:"end_date"`
	Tags        []string   `json:"tags"`
	LeaderID    *string    `json:"leader_id"`
	CoLeaderID  *string    `json:"co_leader_id"`
	MemberCount int        `json:"member_count"`

	// Configurações
	AllowGuests         *bool `json:"allow_guests"`
	RequireApproval     *bool `json:"require_approval"`
	TrackAttendance     *bool `json:"track_attendance"`
	AllowSelfJoin       *bool `json:"allow_self_join"`
	NotifyOnJoinRequest *bool `json:"notify_on_join_request"`
	NotifyOnNewMember   *bool `json:"notify_on_new_member"`
}

func (h *Handler) CreateGroup(c *gin.Context) {
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

	// Verifica se o usuário tem permissão para criar grupos
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para criar grupos"})
		return
	}

	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Cria o grupo
	group := &domain.Group{
		ID:          uuid.New().String(),
		CommunityID: communityID,
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		Category:    req.Category,
		Status:      req.Status,
		Visibility:  req.Visibility,
		Location:    req.Location,
		MeetingDay:  req.MeetingDay,
		MeetingTime: req.MeetingTime,
		Frequency:   req.Frequency,
		MaxMembers:  req.MaxMembers,
		MinAge:      req.MinAge,
		MaxAge:      req.MaxAge,
		Gender:      req.Gender,
		StartDate:   req.StartDate,
		Tags:        req.Tags,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		MemberCount: req.MemberCount,
		LeaderID:    req.LeaderID,
		CoLeaderID:  req.CoLeaderID,

		// Configurações com valores do request ou padrões
		AllowGuests:         getBoolOrDefault(req.AllowGuests, true),
		RequireApproval:     getBoolOrDefault(req.RequireApproval, false),
		TrackAttendance:     getBoolOrDefault(req.TrackAttendance, true),
		AllowSelfJoin:       getBoolOrDefault(req.AllowSelfJoin, true),
		NotifyOnJoinRequest: getBoolOrDefault(req.NotifyOnJoinRequest, true),
		NotifyOnNewMember:   getBoolOrDefault(req.NotifyOnNewMember, true),
	}

	if err := h.repos.Group.Create(context.Background(), group); err != nil {
		h.logger.Error("erro ao criar grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Grupo criado com sucesso",
		"group":   group,
	})
}

func (h *Handler) ListGroups(c *gin.Context) {
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

	// Obtém os parâmetros de paginação
	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
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

	// Lista os grupos
	groups, total, err := h.repos.Group.List(context.Background(), communityID, filter)
	if err != nil {
		h.logger.Error("erro ao listar grupos", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"groups": groups,
		"pagination": gin.H{
			"total":       total,
			"page":        filter.Page,
			"per_page":    filter.PerPage,
			"total_pages": (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
		},
	})
}

func (h *Handler) GetGroup(c *gin.Context) {
	communityID := c.Param("communityId")
	groupID := c.Param("groupId")

	// Busca o grupo
	group, err := h.repos.Group.FindByID(context.Background(), communityID, groupID)
	if err != nil {
		h.logger.Error("erro ao buscar grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if group == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grupo não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"group": group,
	})
}

func (h *Handler) UpdateGroup(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	groupID := c.Param("groupId")

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

	// Verifica se o usuário tem permissão para editar grupos
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para editar grupos"})
		return
	}

	// Busca o grupo
	group, err := h.repos.Group.FindByID(context.Background(), communityID, groupID)
	if err != nil {
		h.logger.Error("erro ao buscar grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if group == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grupo não encontrado"})
		return
	}

	var req UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Atualiza o grupo
	group.Name = req.Name
	group.Description = req.Description
	group.Type = req.Type
	group.Category = req.Category
	group.Status = req.Status
	group.Visibility = req.Visibility
	group.Location = req.Location
	group.MeetingDay = req.MeetingDay
	group.MeetingTime = req.MeetingTime
	group.Frequency = req.Frequency
	group.MaxMembers = req.MaxMembers
	group.MinAge = req.MinAge
	group.MaxAge = req.MaxAge
	group.Gender = req.Gender
	group.StartDate = req.StartDate
	group.EndDate = req.EndDate
	group.Tags = req.Tags
	group.LeaderID = req.LeaderID
	group.CoLeaderID = req.CoLeaderID

	// Atualiza as configurações
	group.AllowGuests = getBoolOrDefault(req.AllowGuests, group.AllowGuests)
	group.RequireApproval = getBoolOrDefault(req.RequireApproval, group.RequireApproval)
	group.TrackAttendance = getBoolOrDefault(req.TrackAttendance, group.TrackAttendance)
	group.AllowSelfJoin = getBoolOrDefault(req.AllowSelfJoin, group.AllowSelfJoin)
	group.NotifyOnJoinRequest = getBoolOrDefault(req.NotifyOnJoinRequest, group.NotifyOnJoinRequest)
	group.NotifyOnNewMember = getBoolOrDefault(req.NotifyOnNewMember, group.NotifyOnNewMember)

	group.UpdatedAt = time.Now()

	if err := h.repos.Group.Update(context.Background(), group); err != nil {
		h.logger.Error("erro ao atualizar grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Grupo atualizado com sucesso",
		"group":   group,
	})
}

func (h *Handler) DeleteGroup(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	groupID := c.Param("groupId")

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

	// Verifica se o usuário tem permissão para remover grupos
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para remover grupos"})
		return
	}

	// Remove o grupo
	if err := h.repos.Group.Delete(context.Background(), communityID, groupID); err != nil {
		h.logger.Error("erro ao remover grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Grupo removido com sucesso",
	})
}

func (h *Handler) AddGroupMember(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	groupID := c.Param("groupId")
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

	// Verifica se o usuário tem permissão para adicionar membros ao grupo
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para adicionar membros ao grupo"})
		return
	}

	// Verifica se o grupo existe
	group, err := h.repos.Group.FindByID(context.Background(), communityID, groupID)
	if err != nil {
		h.logger.Error("erro ao buscar grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if group == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grupo não encontrado"})
		return
	}

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

	// Adiciona o membro ao grupo
	if err := h.repos.Group.AddMember(context.Background(), communityID, groupID, memberID); err != nil {
		h.logger.Error("erro ao adicionar membro ao grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Membro adicionado ao grupo com sucesso",
	})
}

func (h *Handler) RemoveGroupMember(c *gin.Context) {
	// Obtém o usuário do contexto
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	communityID := c.Param("communityId")
	groupID := c.Param("groupId")
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

	// Verifica se o usuário tem permissão para remover membros do grupo
	if community.CreatedBy != user.(*domain.User).ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Você não tem permissão para remover membros do grupo"})
		return
	}

	// Verifica se o grupo existe
	group, err := h.repos.Group.FindByID(context.Background(), communityID, groupID)
	if err != nil {
		h.logger.Error("erro ao buscar grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if group == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grupo não encontrado"})
		return
	}

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

	// Remove o membro do grupo
	if err := h.repos.Group.RemoveMember(context.Background(), communityID, groupID, memberID); err != nil {
		h.logger.Error("erro ao remover membro do grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Membro removido do grupo com sucesso",
	})
}

func (h *Handler) ListGroupMembers(c *gin.Context) {
	communityID := c.Param("communityId")
	groupID := c.Param("groupId")

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

	// Verifica se o grupo existe
	group, err := h.repos.Group.FindByID(context.Background(), communityID, groupID)
	if err != nil {
		h.logger.Error("erro ao buscar grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if group == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grupo não encontrado"})
		return
	}

	// Obtém os parâmetros de paginação
	filter := &repository.Filter{
		Page:    1,
		PerPage: 10,
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

	// Lista os membros do grupo
	members, err := h.repos.Group.ListMembers(context.Background(), groupID, filter)
	if err != nil {
		h.logger.Error("erro ao listar membros do grupo", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"members": members,
		"pagination": gin.H{
			"page":     filter.Page,
			"per_page": filter.PerPage,
		},
	})
}

// Função auxiliar para obter valor booleano do request ou usar valor padrão
func getBoolOrDefault(value *bool, defaultValue bool) bool {
	if value == nil {
		return defaultValue
	}
	return *value
}
