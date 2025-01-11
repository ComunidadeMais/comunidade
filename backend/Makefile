.PHONY: setup run test lint build docker-up docker-down migrate-up migrate-down

setup:
	go mod download
	go install github.com/golang/mock/mockgen@v1.6.0
	go install github.com/swaggo/swag/cmd/swag@latest

run:
	go run cmd/api/main.go

test:
	go test -v -cover ./...

lint:
	golangci-lint run

build:
	go build -o bin/api cmd/api/main.go

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

migrate-up:
	migrate -path database/migrations -database "postgresql://postgres:postgres@localhost:5432/comunidade_plus?sslmode=disable" up

migrate-down:
	migrate -path database/migrations -database "postgresql://postgres:postgres@localhost:5432/comunidade_plus?sslmode=disable" down

swagger:
	swag init -g cmd/api/main.go -o api/docs

.DEFAULT_GOAL := run 