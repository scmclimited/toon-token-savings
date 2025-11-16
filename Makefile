.PHONY: help install install-backend install-frontend test test-backend test-frontend run run-backend run-frontend build build-backend build-frontend clean clean-backend clean-frontend docker-build docker-build-backend docker-build-frontend docker-up docker-down docker-logs docker-restart

# Default target
help:
	@echo "Available targets:"
	@echo "  make install          - Install all dependencies (backend + frontend)"
	@echo "  make install-backend  - Install Python backend dependencies"
	@echo "  make install-frontend - Install Node.js frontend dependencies"
	@echo "  make test             - Run all tests (backend + frontend)"
	@echo "  make test-backend     - Run Python backend tests"
	@echo "  make test-frontend    - Run React frontend tests"
	@echo "  make run              - Run both backend and frontend (requires two terminals)"
	@echo "  make run-backend      - Start the FastAPI server"
	@echo "  make run-frontend     - Start the React development server"
	@echo "  make build            - Build both backend and frontend"
	@echo "  make build-backend    - Build Python package"
	@echo "  make build-frontend   - Build React app for production"
	@echo "  make clean            - Clean all build artifacts"
	@echo "  make clean-backend    - Clean Python build artifacts"
	@echo "  make clean-frontend   - Clean React build artifacts"
	@echo ""
	@echo "Docker targets:"
	@echo "  make docker-build     - Build all Docker images"
	@echo "  make docker-build-backend  - Build backend Docker image"
	@echo "  make docker-build-frontend - Build frontend Docker image"
	@echo "  make docker-up        - Start all services with docker-compose"
	@echo "  make docker-down      - Stop all services"
	@echo "  make docker-logs      - View logs from all services"
	@echo "  make docker-restart   - Restart all services"

# Installation targets
install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	pip install -r requirements.txt
	pip install -e .

install-frontend:
	@echo "Installing frontend dependencies..."
	cd react-frontend && npm install

# Test targets
test: test-backend test-frontend

test-backend:
	@echo "Running backend tests..."
	python -m pytest tests/ -v

test-frontend:
	@echo "Running frontend tests..."
	cd react-frontend && npm test -- --watchAll=false --passWithNoTests

# Run targets (development)
run-backend:
	@echo "Starting FastAPI server on http://localhost:8000"
	uvicorn src.server:app --reload --host 0.0.0.0 --port 8000

run-frontend:
	@echo "Starting React development server on http://localhost:3000"
	cd react-frontend && npm start

# Build targets
build: build-backend build-frontend

build-backend:
	@echo "Building Python package..."
	python -m build

build-frontend:
	@echo "Building React app for production..."
	cd react-frontend && npm run build

# Clean targets
clean: clean-backend clean-frontend

clean-backend:
	@echo "Cleaning Python build artifacts..."
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

clean-frontend:
	@echo "Cleaning React build artifacts..."
	cd react-frontend && rm -rf build/ node_modules/.cache/

# Docker targets
docker-build: docker-build-backend docker-build-frontend

docker-build-backend:
	@echo "Building backend Docker image..."
	docker build -t toon-token-savings-backend -f Dockerfile.backend .

docker-build-frontend:
	@echo "Building frontend Docker image..."
	docker build -t toon-token-savings-frontend -f Dockerfile.frontend .

docker-up:
	@echo "Starting services with docker-compose..."
	docker-compose up -d

docker-down:
	@echo "Stopping services..."
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-restart: docker-down docker-up

