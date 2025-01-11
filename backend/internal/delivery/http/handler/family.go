package handler

import (
	"context"
	"net/http"

	"github.com/comunidade/backend/internal/domain"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AddFamilyRequest struct {
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description"`
	HeadOfFamily string `json:"head_of_family"`
}

type UpdateFamilyRequest struct {
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description"`
	HeadOfFamily string `json:"head_of_family"`
}

type AddFamilyMemberRequest struct {
	MemberID string `json:"member_id" binding:"required,uuid"`
	Role     string `json:"role" binding:"required"`
}

// ListFamilies lista todas as famílias de uma comunidade
func (h *Handler) ListFamilies(c *gin.Context) {
	communityID := c.Param("communityId")

	families, err := h.repos.Family.ListByCommunity(context.Background(), communityID)
	if err != nil {
		h.logger.Error("erro ao listar famílias", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"families": families,
	})
}

// GetFamily retorna os detalhes de uma família
func (h *Handler) GetFamily(c *gin.Context) {
	communityID := c.Param("communityId")
	familyID := c.Param("familyId")

	family, err := h.repos.Family.FindByID(context.Background(), communityID, familyID)
	if err != nil {
		h.logger.Error("erro ao buscar família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if family == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Família não encontrada"})
		return
	}

	// Busca os membros da família
	members, err := h.repos.Family.ListFamilyMembers(context.Background(), familyID)
	if err != nil {
		h.logger.Error("erro ao listar membros da família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"family":  family,
		"members": members,
	})
}

// AddFamily cria uma nova família
func (h *Handler) AddFamily(c *gin.Context) {
	communityID := c.Param("communityId")

	var req AddFamilyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	family := &domain.Family{
		CommunityID:  communityID,
		Name:         req.Name,
		Description:  req.Description,
		HeadOfFamily: req.HeadOfFamily,
	}

	if err := h.repos.Family.Create(context.Background(), family); err != nil {
		h.logger.Error("erro ao criar família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Família criada com sucesso",
		"family":  family,
	})
}

// UpdateFamily atualiza os dados de uma família
func (h *Handler) UpdateFamily(c *gin.Context) {
	communityID := c.Param("communityId")
	familyID := c.Param("familyId")

	var req UpdateFamilyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	family, err := h.repos.Family.FindByID(context.Background(), communityID, familyID)
	if err != nil {
		h.logger.Error("erro ao buscar família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if family == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Família não encontrada"})
		return
	}

	family.Name = req.Name
	family.Description = req.Description
	family.HeadOfFamily = req.HeadOfFamily

	if err := h.repos.Family.Update(context.Background(), family); err != nil {
		h.logger.Error("erro ao atualizar família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Família atualizada com sucesso",
		"family":  family,
	})
}

// DeleteFamily remove uma família
func (h *Handler) DeleteFamily(c *gin.Context) {
	communityID := c.Param("communityId")
	familyID := c.Param("familyId")

	if err := h.repos.Family.Delete(context.Background(), communityID, familyID); err != nil {
		h.logger.Error("erro ao remover família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Família removida com sucesso",
	})
}

// AddFamilyMember adiciona um membro à família
func (h *Handler) AddFamilyMember(c *gin.Context) {
	communityID := c.Param("communityId")
	familyID := c.Param("familyId")

	var req AddFamilyMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	// Verifica se a família existe
	family, err := h.repos.Family.FindByID(context.Background(), communityID, familyID)
	if err != nil {
		h.logger.Error("erro ao buscar família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if family == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Família não encontrada"})
		return
	}

	// Verifica se o membro existe
	member, err := h.repos.Member.FindByID(context.Background(), communityID, req.MemberID)
	if err != nil {
		h.logger.Error("erro ao buscar membro", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}
	if member == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Membro não encontrado"})
		return
	}

	familyMember := &domain.FamilyMember{
		FamilyID: familyID,
		MemberID: req.MemberID,
		Role:     req.Role,
	}

	if err := h.repos.Family.AddMember(context.Background(), familyMember); err != nil {
		h.logger.Error("erro ao adicionar membro à família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Membro adicionado à família com sucesso",
		"member":  familyMember,
	})
}

// RemoveFamilyMember remove um membro da família
func (h *Handler) RemoveFamilyMember(c *gin.Context) {
	familyID := c.Param("familyId")
	memberID := c.Param("memberId")

	if err := h.repos.Family.RemoveMember(context.Background(), familyID, memberID); err != nil {
		h.logger.Error("erro ao remover membro da família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Membro removido da família com sucesso",
	})
}

// UpdateFamilyMemberRole atualiza o papel de um membro na família
func (h *Handler) UpdateFamilyMemberRole(c *gin.Context) {
	familyID := c.Param("familyId")
	memberID := c.Param("memberId")

	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	if err := h.repos.Family.UpdateMemberRole(context.Background(), familyID, memberID, req.Role); err != nil {
		h.logger.Error("erro ao atualizar papel do membro na família", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Papel do membro atualizado com sucesso",
	})
}
