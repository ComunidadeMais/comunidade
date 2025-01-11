# Comunidade+

Sistema de gestão para comunidades religiosas, desenvolvido para facilitar a administração de membros, eventos, grupos e atividades.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Frontend (/frontend)
- Desenvolvido com React + TypeScript
- Material-UI para interface
- Gerenciamento de estado com Context API
- Sistema de rotas com React Router

### Backend (/backend)
- Desenvolvido em Go
- API RESTful
- PostgreSQL como banco de dados
- Autenticação JWT

## Requisitos

### Frontend
- Node.js 18+
- npm ou yarn

### Backend
- Go 1.19+
- PostgreSQL 14+

## Configuração e Instalação

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
go mod download
go run cmd/main.go
```

## Funcionalidades Principais

- Gestão de Membros
- Gestão de Famílias
- Gestão de Grupos
- Calendário de Eventos
- Sistema de Autenticação
- Múltiplas Comunidades

## Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
