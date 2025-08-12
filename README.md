# Comunidade+

Sistema de gestão para comunidades religiosas, desenvolvido para facilitar a administração de membros, eventos, grupos e atividades.

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [Configuração e Instalação](#configuração-e-instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy](#deploy)
- [Funcionalidades](#funcionalidades)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🏗 Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Frontend (/frontend)
- Desenvolvido com React + TypeScript
- Material-UI para interface
- Gerenciamento de estado com Context API e React Query
- Sistema de rotas com React Router

### Backend (/backend)
- Desenvolvido em Go
- API RESTful com Gin Framework
- PostgreSQL como banco de dados
- Autenticação JWT
- SMTP para envio de emails
- Upload de arquivos

## 📋 Requisitos

### Desenvolvimento
- Go 1.19+
- PostgreSQL 14+
- Docker (opcional)
- Make (opcional)

### Produção
- Conta no Fly.io
- Flyctl CLI instalado
- PostgreSQL (pode ser hospedado no Fly.io ou outro provedor)

## 🛠 Configuração e Instalação

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/comunidade.git
cd comunidade/backend
```

2. Instale as dependências:
```bash
go mod download
```

3. Configure o banco de dados PostgreSQL:
```bash
createdb comunidade_plus
```

4. Configure as variáveis de ambiente (copie o exemplo e ajuste):
```bash
cp .env.example .env
```

5. Execute a aplicação:
```bash
go run cmd/api/main.go
```

## 🔐 Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

```env
# Server
PORT=8080
SERVER_TIMEOUT=30

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=comunidade_plus
DATABASE_SSLMODE=disable
DATABASE_TIMEZONE=UTC

# JWT
JWT_SECRET=seu-secret-key-aqui
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=168h

# Storage
UPLOADS_DIR=./storage

# Email (SMTP)
SMTP_HOST=seu-smtp-host
SMTP_PORT=587
SMTP_USER=seu-email
SMTP_PASSWORD=sua-senha
FROM_NAME=Nome do Remetente
FROM_EMAIL=email-remetente
```

## 🚀 Deploy

### Deploy no Fly.io

1. Instale o Flyctl:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Faça login no Fly.io:
```bash
fly auth login
```

3. Configure a aplicação (primeira vez):
```bash
fly launch
```

4. Configure as secrets:
```bash
fly secrets set \
  DATABASE_HOST=seu-host \
  DATABASE_PORT=5432 \
  DATABASE_USER=seu-usuario \
  DATABASE_PASSWORD=sua-senha \
  DATABASE_NAME=seu-banco \
  DATABASE_SSLMODE=disable \
  JWT_SECRET=seu-secret \
  SMTP_HOST=seu-smtp \
  SMTP_PORT=587 \
  SMTP_USER=seu-email \
  SMTP_PASSWORD=sua-senha \
  FROM_NAME="Nome Remetente" \
  FROM_EMAIL=email-remetente
```

5. Deploy da aplicação:
```bash
fly deploy
```

### Monitoramento e Logs

- Verificar status:
```bash
fly status
```

- Visualizar logs:
```bash
fly logs
```

### Restauração em Caso de Falha

Se uma máquina for excluída acidentalmente:

1. Verifique o status:
```bash
fly status
```

2. Reimplante a aplicação:
```bash
fly deploy
```

3. Verifique se está funcionando:
```bash
fly status
fly logs
```

As secrets e configurações são mantidas mesmo que a máquina seja excluída.

## ✨ Funcionalidades

- Gestão de Membros
  - Cadastro e atualização
  - Histórico de participação
  - Upload de fotos

- Gestão de Famílias
  - Vínculos familiares
  - Histórico familiar

- Gestão de Grupos
  - Células e ministérios
  - Liderança e participantes

- Eventos
  - Calendário
  - Check-in
  - Relatórios de presença

- Comunicação
  - Envio de emails
  - Templates personalizados
  - Histórico de comunicações

- Financeiro
  - Categorias
  - Receitas e despesas
  - Relatórios

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
