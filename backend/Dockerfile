# Build stage
FROM golang:1.22-alpine AS builder

# Instala dependências do sistema
RUN apk add --no-cache git

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos go.mod e go.sum
COPY go.mod go.sum ./

# Baixa as dependências
RUN go mod download

# Copia o código fonte
COPY . .

# Compila a aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

# Final stage
FROM alpine:latest

# Instala o ca-certificates para HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copia o binário compilado do estágio anterior
COPY --from=builder /app/main .
COPY --from=builder /app/internal/config/config.prod.yaml ./internal/config/config.yaml

# Cria diretório para uploads
RUN mkdir -p ./uploads/posts

# Expõe a porta 8080
EXPOSE 8080

# Define variável de ambiente para produção
ENV GO_ENV=production

# Comando para executar a aplicação
CMD ["./main"] 