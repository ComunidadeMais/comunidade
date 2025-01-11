package service

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

type UploadService struct {
	uploadDir string
}

func NewUploadService(uploadDir string) *UploadService {
	return &UploadService{
		uploadDir: uploadDir,
	}
}

func (s *UploadService) SaveFile(file *multipart.FileHeader, folder string) (string, error) {
	// Verifica se o diretório existe, se não, cria
	uploadPath := filepath.Join(s.uploadDir, folder)
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		return "", fmt.Errorf("erro ao criar diretório: %v", err)
	}

	// Gera um nome único para o arquivo
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s-%s%s",
		uuid.New().String(),
		strings.ReplaceAll(time.Now().Format(time.RFC3339), ":", "-"),
		ext,
	)

	// Abre o arquivo enviado
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("erro ao abrir arquivo: %v", err)
	}
	defer src.Close()

	// Cria o arquivo de destino
	dst, err := os.Create(filepath.Join(uploadPath, filename))
	if err != nil {
		return "", fmt.Errorf("erro ao criar arquivo: %v", err)
	}
	defer dst.Close()

	// Copia o conteúdo
	if _, err = io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("erro ao copiar arquivo: %v", err)
	}

	// Retorna o caminho relativo do arquivo
	return filepath.Join(folder, filename), nil
}

func (s *UploadService) DeleteFile(filePath string) error {
	fullPath := path.Join(s.uploadDir, filePath)
	if err := os.Remove(fullPath); err != nil {
		return fmt.Errorf("erro ao deletar arquivo: %v", err)
	}
	return nil
}
