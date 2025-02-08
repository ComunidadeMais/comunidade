package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"mime/multipart"

	"github.com/comunidade/backend/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// GetMemberDashboard retorna o dashboard do membro
func (h *Handler) GetMemberDashboard(c *gin.Context) {
	communityID := c.Param("communityId")
	memberID := c.Param("memberId")

	dashboard, err := h.services.Engagement.GetMemberDashboard(c.Request.Context(), communityID, memberID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dashboard)
}

// Handlers para Posts

type CreatePostRequest struct {
	Title   string                  `form:"title" binding:"required"`
	Content string                  `form:"content" binding:"required"`
	Type    string                  `form:"type" binding:"required,oneof=post announcement devotional"`
	Images  []*multipart.FileHeader `form:"images"`
}

func (h *Handler) CreatePost(c *gin.Context) {
	communityID := c.Param("communityId")
	memberID := c.GetString("memberId")

	// Debug form data
	form, err := c.MultipartForm()
	if err != nil {
		h.logger.Error("Erro ao obter form data", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get form data"})
		return
	}

	h.logger.Info("Form data recebido",
		zap.Any("fields", form.Value),
		zap.Any("file_headers", form.File))

	// Criar diretório de uploads se não existir
	uploadsDir := filepath.Join("uploads", "posts")
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		h.logger.Error("Erro ao criar diretório", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create uploads directory"})
		return
	}

	var req CreatePostRequest
	if err := c.ShouldBind(&req); err != nil {
		h.logger.Error("Erro ao fazer bind dos dados", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Debug log
	h.logger.Info("Processando upload de imagens",
		zap.Int("quantidade", len(req.Images)),
		zap.String("community_id", communityID),
		zap.String("member_id", memberID))

	// Processar imagens
	var imageNames []string
	if len(req.Images) > 0 {
		for i, file := range req.Images {
			// Verificar se o arquivo tem conteúdo
			if file.Size == 0 {
				h.logger.Error("Arquivo vazio recebido",
					zap.Int("index", i),
					zap.String("filename", file.Filename))
				c.JSON(http.StatusBadRequest, gin.H{"error": "Empty file received"})
				return
			}

			// Debug do arquivo
			h.logger.Info("Dados do arquivo",
				zap.Int("index", i),
				zap.String("filename", file.Filename),
				zap.Int64("size", file.Size),
				zap.String("content_type", file.Header.Get("Content-Type")))

			// Gerar nome único para o arquivo
			ext := filepath.Ext(file.Filename)
			fileName := fmt.Sprintf("posts/%s-%s%s", uuid.New().String(), time.Now().Format("20060102150405"), ext)

			// Definir caminho do arquivo
			uploadPath := filepath.Join("uploads", fileName)

			// Debug log
			h.logger.Info("Salvando arquivo",
				zap.Int("index", i),
				zap.String("original_name", file.Filename),
				zap.String("save_path", uploadPath))

			// Salvar arquivo
			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				h.logger.Error("Erro ao salvar arquivo",
					zap.Error(err),
					zap.String("path", uploadPath))
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
				return
			}

			// Verificar se o arquivo foi salvo
			if _, err := os.Stat(uploadPath); os.IsNotExist(err) {
				h.logger.Error("Arquivo não foi salvo",
					zap.String("path", uploadPath))
				c.JSON(http.StatusInternalServerError, gin.H{"error": "File was not saved"})
				return
			}

			imageNames = append(imageNames, fileName)
		}
	}

	post := &domain.CommunityPost{
		CommunityID: communityID,
		AuthorID:    memberID,
		Title:       req.Title,
		Content:     req.Content,
		Type:        req.Type,
		Images:      imageNames,
	}

	// Debug log
	h.logger.Info("Criando post",
		zap.Any("post", post))

	if err := h.services.Engagement.CreatePost(c.Request.Context(), communityID, post); err != nil {
		h.logger.Error("Erro ao criar post",
			zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Debug final
	h.logger.Info("Post criado com sucesso",
		zap.String("id", post.ID),
		zap.Any("images", post.Images))

	c.JSON(http.StatusCreated, post)
}

func (h *Handler) GetPost(c *gin.Context) {
	communityID := c.Param("communityId")
	postID := c.Param("postId")

	post, err := h.services.Engagement.GetPost(c.Request.Context(), communityID, postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if post == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

type UpdatePostRequest struct {
	Title          string                  `form:"title" binding:"required"`
	Content        string                  `form:"content" binding:"required"`
	Type           string                  `form:"type"`
	ExistingImages string                  `form:"existing_images"`
	Images         []*multipart.FileHeader `form:"images"`
}

func (h *Handler) UpdatePost(c *gin.Context) {
	communityID := c.Param("communityId")
	postID := c.Param("postId")
	memberID := c.GetString("memberId")

	// Debug form data
	form, err := c.MultipartForm()
	if err != nil {
		h.logger.Error("Erro ao obter form data", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get form data"})
		return
	}

	h.logger.Info("Form data recebido",
		zap.Any("fields", form.Value),
		zap.Any("file_headers", form.File))

	var req UpdatePostRequest
	if err := c.ShouldBind(&req); err != nil {
		h.logger.Error("Erro ao fazer bind dos dados", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar o post existente
	post, err := h.services.Engagement.GetPost(c.Request.Context(), communityID, postID)
	if err != nil {
		h.logger.Error("Erro ao buscar post", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if post == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	// Verificar se o usuário é o autor do post
	if post.AuthorID != memberID {
		c.JSON(http.StatusForbidden, gin.H{"error": "not authorized to update this post"})
		return
	}

	// Atualizar campos básicos
	post.Title = req.Title
	post.Content = req.Content
	if req.Type != "" {
		post.Type = req.Type
	}

	// Processar imagens existentes
	var existingImages []string
	if req.ExistingImages != "" {
		if err := json.Unmarshal([]byte(req.ExistingImages), &existingImages); err != nil {
			h.logger.Error("Erro ao decodificar existing_images", zap.Error(err))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid existing_images format"})
			return
		}
	}

	// Remover imagens que não estão mais na lista
	for _, oldImage := range post.Images {
		found := false
		for _, keepImage := range existingImages {
			if oldImage == keepImage {
				found = true
				break
			}
		}
		if !found {
			// Remover arquivo físico
			imagePath := filepath.Join("uploads", oldImage)
			if err := os.Remove(imagePath); err != nil && !os.IsNotExist(err) {
				h.logger.Error("Erro ao remover imagem antiga",
					zap.Error(err),
					zap.String("path", imagePath))
			}
		}
	}

	// Processar novas imagens
	var newImages []string
	if len(req.Images) > 0 {
		uploadsDir := filepath.Join("uploads", "posts")
		if err := os.MkdirAll(uploadsDir, 0755); err != nil {
			h.logger.Error("Erro ao criar diretório", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create uploads directory"})
			return
		}

		for _, file := range req.Images {
			if file.Size == 0 {
				continue
			}

			ext := filepath.Ext(file.Filename)
			fileName := fmt.Sprintf("posts/%s-%s%s", uuid.New().String(), time.Now().Format("20060102150405"), ext)
			uploadPath := filepath.Join("uploads", fileName)

			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				h.logger.Error("Erro ao salvar nova imagem",
					zap.Error(err),
					zap.String("path", uploadPath))
				continue
			}

			newImages = append(newImages, fileName)
		}
	}

	// Atualizar lista de imagens do post
	post.Images = append(existingImages, newImages...)

	// Salvar alterações
	if err := h.services.Engagement.UpdatePost(c.Request.Context(), communityID, post); err != nil {
		h.logger.Error("Erro ao atualizar post", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

func (h *Handler) DeletePost(c *gin.Context) {
	communityID := c.Param("communityId")
	postID := c.Param("postId")

	if err := h.services.Engagement.DeletePost(c.Request.Context(), communityID, postID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) ListPosts(c *gin.Context) {
	communityID := c.Param("communityId")

	posts, total, err := h.services.Engagement.ListPosts(c.Request.Context(), communityID, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts":       posts,
		"total":       total,
		"page":        1,
		"total_pages": 1,
	})
}

// Handlers para Comentários

type CreateCommentRequest struct {
	Content string `json:"content" binding:"required"`
}

func (h *Handler) CreateComment(c *gin.Context) {
	postID := c.Param("postId")
	memberID := c.GetString("memberId")

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := &domain.PostComment{
		PostID:   postID,
		AuthorID: memberID,
		Content:  req.Content,
	}

	if err := h.services.Engagement.CreateComment(c.Request.Context(), comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func (h *Handler) DeleteComment(c *gin.Context) {
	postID := c.Param("postId")
	commentID := c.Param("commentId")

	if err := h.services.Engagement.DeleteComment(c.Request.Context(), postID, commentID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// Handlers para Reações

func (h *Handler) CreateReaction(c *gin.Context) {
	postID := c.Param("postId")
	memberID := c.GetString("memberId")
	reactionType := c.Param("type")

	reaction := &domain.PostReaction{
		PostID:   postID,
		MemberID: memberID,
		Type:     reactionType,
	}

	if err := h.services.Engagement.CreateReaction(c.Request.Context(), reaction); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, reaction)
}

func (h *Handler) DeleteReaction(c *gin.Context) {
	postID := c.Param("postId")
	memberID := c.GetString("memberId")

	if err := h.services.Engagement.DeleteReaction(c.Request.Context(), postID, memberID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// Handlers para Pedidos de Oração

type CreatePrayerRequest struct {
	Title     string `json:"title" binding:"required"`
	Content   string `json:"content" binding:"required"`
	IsPrivate bool   `json:"is_private"`
}

func (h *Handler) CreatePrayerRequest(c *gin.Context) {
	communityID := c.Param("communityId")
	memberID := c.GetString("memberId")

	var req CreatePrayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prayer := &domain.PrayerRequest{
		CommunityID: communityID,
		MemberID:    memberID,
		Title:       req.Title,
		Content:     req.Content,
		IsPrivate:   req.IsPrivate,
		Status:      "pending",
	}

	if err := h.services.Engagement.CreatePrayerRequest(c.Request.Context(), communityID, prayer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, prayer)
}

type UpdatePrayerRequest struct {
	Title     string `json:"title" binding:"required"`
	Content   string `json:"content" binding:"required"`
	IsPrivate bool   `json:"is_private"`
	Status    string `json:"status" binding:"required,oneof=pending praying answered"`
}

func (h *Handler) UpdatePrayerRequest(c *gin.Context) {
	communityID := c.Param("communityId")
	prayerID := c.Param("prayerId")

	var req UpdatePrayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prayer, err := h.services.Engagement.GetPrayerRequest(c.Request.Context(), communityID, prayerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if prayer == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "prayer request not found"})
		return
	}

	prayer.Title = req.Title
	prayer.Content = req.Content
	prayer.IsPrivate = req.IsPrivate
	prayer.Status = req.Status

	if err := h.services.Engagement.UpdatePrayerRequest(c.Request.Context(), communityID, prayer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, prayer)
}

func (h *Handler) DeletePrayerRequest(c *gin.Context) {
	communityID := c.Param("communityId")
	prayerID := c.Param("prayerId")

	if err := h.services.Engagement.DeletePrayerRequest(c.Request.Context(), communityID, prayerID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) ListPrayerRequests(c *gin.Context) {
	communityID := c.Param("communityId")

	prayers, total, err := h.services.Engagement.ListPrayerRequests(c.Request.Context(), communityID, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"prayers":     prayers,
		"total":       total,
		"page":        1,
		"total_pages": 1,
	})
}
