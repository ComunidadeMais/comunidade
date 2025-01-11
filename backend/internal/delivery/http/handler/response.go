package handler

// ErrorResponse representa uma resposta de erro da API
type ErrorResponse struct {
	Error string `json:"error"`
}

// ListResponse representa uma resposta paginada da API
type ListResponse struct {
	Data       interface{} `json:"data"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PerPage    int         `json:"per_page"`
	TotalPages int64       `json:"total_pages"`
}
