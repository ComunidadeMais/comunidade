package handler

import (
	"net/http"

	"github.com/comunidade/backend/internal/domain"
	"github.com/comunidade/backend/internal/repository"
	"github.com/comunidade/backend/internal/usecase"
	"github.com/gin-gonic/gin"
)

type GroupHandler struct {
	groupUseCase usecase.GroupUseCase
}

func NewGroupHandler(groupUseCase usecase.GroupUseCase) *GroupHandler {
	return &GroupHandler{
		groupUseCase: groupUseCase,
	}
}

// @Summary Criar um novo grupo
// @Description Cria um novo grupo na comunidade
// @Tags groups
// @Accept json
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param group body domain.Group true "Dados do grupo"
// @Success 201 {object} domain.Group
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups [post]
func (h *GroupHandler) Create(c *gin.Context) {
	var group domain.Group
	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	communityID := c.Param("communityID")
	if err := h.groupUseCase.Create(c.Request.Context(), communityID, &group); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, group)
}

// @Summary Atualizar um grupo
// @Description Atualiza os dados de um grupo existente
// @Tags groups
// @Accept json
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Param group body domain.Group true "Dados do grupo"
// @Success 200 {object} domain.Group
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID} [put]
func (h *GroupHandler) Update(c *gin.Context) {
	var group domain.Group
	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	communityID := c.Param("communityID")
	group.ID = c.Param("groupID")
	if err := h.groupUseCase.Update(c.Request.Context(), communityID, &group); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, group)
}

// @Summary Excluir um grupo
// @Description Remove um grupo existente
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Success 204 "No Content"
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID} [delete]
func (h *GroupHandler) Delete(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")

	if err := h.groupUseCase.Delete(c.Request.Context(), communityID, groupID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Buscar um grupo por ID
// @Description Retorna os detalhes de um grupo específico
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Success 200 {object} domain.Group
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID} [get]
func (h *GroupHandler) GetByID(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")

	group, err := h.groupUseCase.GetByID(c.Request.Context(), communityID, groupID)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, group)
}

// @Summary Listar grupos
// @Description Retorna uma lista paginada de grupos
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param page query int false "Número da página (default: 1)"
// @Param per_page query int false "Itens por página (default: 10)"
// @Param search query string false "Termo de busca"
// @Param order_by query string false "Campo para ordenação"
// @Param order_dir query string false "Direção da ordenação (asc/desc)"
// @Success 200 {object} ListResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups [get]
func (h *GroupHandler) List(c *gin.Context) {
	var filter repository.Filter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	communityID := c.Param("communityID")
	groups, total, err := h.groupUseCase.List(c.Request.Context(), communityID, &filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, ListResponse{
		Data:       groups,
		Total:      total,
		Page:       filter.Page,
		PerPage:    filter.PerPage,
		TotalPages: (total + int64(filter.PerPage) - 1) / int64(filter.PerPage),
	})
}

// @Summary Adicionar membro ao grupo
// @Description Adiciona um membro a um grupo existente
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Param memberID path string true "ID do membro"
// @Success 204 "No Content"
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID}/members/{memberID} [post]
func (h *GroupHandler) AddMember(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")
	memberID := c.Param("memberID")

	if err := h.groupUseCase.AddMember(c.Request.Context(), communityID, groupID, memberID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group or member not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Remover membro do grupo
// @Description Remove um membro de um grupo existente
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Param memberID path string true "ID do membro"
// @Success 204 "No Content"
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID}/members/{memberID} [delete]
func (h *GroupHandler) RemoveMember(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")
	memberID := c.Param("memberID")

	if err := h.groupUseCase.RemoveMember(c.Request.Context(), communityID, groupID, memberID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group or member not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Listar membros do grupo
// @Description Retorna uma lista paginada de membros do grupo
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Param page query int false "Número da página (default: 1)"
// @Param per_page query int false "Itens por página (default: 10)"
// @Param search query string false "Termo de busca"
// @Param order_by query string false "Campo para ordenação"
// @Param order_dir query string false "Direção da ordenação (asc/desc)"
// @Success 200 {object} ListResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID}/members [get]
func (h *GroupHandler) ListMembers(c *gin.Context) {
	var filter repository.Filter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	groupID := c.Param("groupID")
	members, err := h.groupUseCase.ListMembers(c.Request.Context(), groupID, &filter)
	if err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, members)
}

// @Summary Definir líder do grupo
// @Description Define um membro como líder do grupo
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Param leaderID path string true "ID do líder"
// @Success 204 "No Content"
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID}/leader/{leaderID} [put]
func (h *GroupHandler) SetLeader(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")
	leaderID := c.Param("leaderID")

	if err := h.groupUseCase.SetLeader(c.Request.Context(), communityID, groupID, leaderID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group or member not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Definir co-líder do grupo
// @Description Define um membro como co-líder do grupo
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Param coLeaderID path string true "ID do co-líder"
// @Success 204 "No Content"
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID}/co-leader/{coLeaderID} [put]
func (h *GroupHandler) SetCoLeader(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")
	coLeaderID := c.Param("coLeaderID")

	if err := h.groupUseCase.SetCoLeader(c.Request.Context(), communityID, groupID, coLeaderID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group or member not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Remover líder do grupo
// @Description Remove o líder atual do grupo
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Success 204 "No Content"
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID}/leader [delete]
func (h *GroupHandler) RemoveLeader(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")

	if err := h.groupUseCase.RemoveLeader(c.Request.Context(), communityID, groupID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Remover co-líder do grupo
// @Description Remove o co-líder atual do grupo
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param groupID path string true "ID do grupo"
// @Success 204 "No Content"
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/{groupID}/co-leader [delete]
func (h *GroupHandler) RemoveCoLeader(c *gin.Context) {
	communityID := c.Param("communityID")
	groupID := c.Param("groupID")

	if err := h.groupUseCase.RemoveCoLeader(c.Request.Context(), communityID, groupID); err != nil {
		if err == repository.ErrNotFound {
			c.JSON(http.StatusNotFound, ErrorResponse{Error: "group not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Buscar grupos por tipo
// @Description Retorna uma lista paginada de grupos de um determinado tipo
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param type path string true "Tipo do grupo"
// @Param page query int false "Número da página (default: 1)"
// @Param per_page query int false "Itens por página (default: 10)"
// @Param search query string false "Termo de busca"
// @Param order_by query string false "Campo para ordenação"
// @Param order_dir query string false "Direção da ordenação (asc/desc)"
// @Success 200 {object} ListResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/type/{type} [get]
func (h *GroupHandler) FindByType(c *gin.Context) {
	var filter repository.Filter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	communityID := c.Param("communityID")
	groupType := c.Param("type")

	groups, err := h.groupUseCase.FindByType(c.Request.Context(), communityID, groupType, &filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, groups)
}

// @Summary Buscar grupos por categoria
// @Description Retorna uma lista paginada de grupos de uma determinada categoria
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param category path string true "Categoria do grupo"
// @Param page query int false "Número da página (default: 1)"
// @Param per_page query int false "Itens por página (default: 10)"
// @Param search query string false "Termo de busca"
// @Param order_by query string false "Campo para ordenação"
// @Param order_dir query string false "Direção da ordenação (asc/desc)"
// @Success 200 {object} ListResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/category/{category} [get]
func (h *GroupHandler) FindByCategory(c *gin.Context) {
	var filter repository.Filter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	communityID := c.Param("communityID")
	category := c.Param("category")

	groups, err := h.groupUseCase.FindByCategory(c.Request.Context(), communityID, category, &filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, groups)
}

// @Summary Buscar grupos
// @Description Retorna uma lista paginada de grupos que correspondem ao termo de busca
// @Tags groups
// @Produce json
// @Param communityID path string true "ID da comunidade"
// @Param query query string true "Termo de busca"
// @Param page query int false "Número da página (default: 1)"
// @Param per_page query int false "Itens por página (default: 10)"
// @Param order_by query string false "Campo para ordenação"
// @Param order_dir query string false "Direção da ordenação (asc/desc)"
// @Success 200 {object} ListResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/communities/{communityID}/groups/search [get]
func (h *GroupHandler) Search(c *gin.Context) {
	var filter repository.Filter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	communityID := c.Param("communityID")
	query := c.Query("query")
	if query == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "search query is required"})
		return
	}

	groups, err := h.groupUseCase.Search(c.Request.Context(), communityID, query, &filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, groups)
}
