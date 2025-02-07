package handler

import (
	"net/http"

	"github.com/comunidade/backend/internal/domain"
	"github.com/gin-gonic/gin"
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
	Title   string `json:"title" binding:"required"`
	Content string `json:"content" binding:"required"`
	Type    string `json:"type" binding:"required,oneof=post announcement devotional"`
}

func (h *Handler) CreatePost(c *gin.Context) {
	communityID := c.Param("communityId")
	userID := c.GetString("userId")

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post := &domain.CommunityPost{
		CommunityID: communityID,
		AuthorID:    userID,
		Title:       req.Title,
		Content:     req.Content,
		Type:        req.Type,
	}

	if err := h.services.Engagement.CreatePost(c.Request.Context(), communityID, post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

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
	Title   string `json:"title" binding:"required"`
	Content string `json:"content" binding:"required"`
}

func (h *Handler) UpdatePost(c *gin.Context) {
	communityID := c.Param("communityId")
	postID := c.Param("postId")

	var req UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.services.Engagement.GetPost(c.Request.Context(), communityID, postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if post == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	post.Title = req.Title
	post.Content = req.Content

	if err := h.services.Engagement.UpdatePost(c.Request.Context(), communityID, post); err != nil {
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
	userID := c.GetString("userId")

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := &domain.PostComment{
		PostID:   postID,
		AuthorID: userID,
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
	userID := c.GetString("userId")
	reactionType := c.Param("type")

	reaction := &domain.PostReaction{
		PostID:   postID,
		MemberID: userID,
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
	userID := c.GetString("userId")

	if err := h.services.Engagement.DeleteReaction(c.Request.Context(), postID, userID); err != nil {
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
	userID := c.GetString("userId")

	var req CreatePrayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prayer := &domain.PrayerRequest{
		CommunityID: communityID,
		MemberID:    userID,
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
