# ==============================================================================
# SimpleStock Monorepo Makefile
# ==============================================================================
# Orchestration commands for the SimpleStock monorepo.
# This Makefile wraps npm scripts from packages/web and packages/server.
#
# Usage:
#   make help     - Show all available commands
#   make install  - Install dependencies for all packages
#   make dev      - Start both web and server in development mode
#   make build    - Build both packages for production
#
# ==============================================================================

# ------------------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------------------

# Package directories (relative to this Makefile)
WEB_DIR := web
SERVER_DIR := server

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m
BOLD := \033[1m

# Default target
.DEFAULT_GOAL := help

# Declare all phony targets (commands, not files)
.PHONY: help install install-web install-server \
        dev dev-web dev-server dev-demo \
        build build-web build-server build-demo \
        start preview preview-demo \
        lint lint-web lint-server format \
        test test-watch test-coverage \
        seed-admin clean clean-web clean-server \
        check status

# ------------------------------------------------------------------------------
# Help
# ------------------------------------------------------------------------------

##@ General

help: ## Show this help message
	@echo ""
	@echo "$(BOLD)SimpleStock Monorepo$(RESET)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} \
		/^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2 } \
		/^##@/ { printf "\n$(BOLD)%s$(RESET)\n", substr($$0, 5) }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Examples:$(RESET)"
	@echo "  make install    # Install all dependencies"
	@echo "  make dev        # Start both web and server"
	@echo "  make dev-web    # Start only the web frontend"
	@echo "  make build      # Build both packages"
	@echo ""

# ------------------------------------------------------------------------------
# Installation
# ------------------------------------------------------------------------------

##@ Installation

install: install-web install-server ## Install dependencies for all packages
	@echo "$(GREEN)✓ All dependencies installed$(RESET)"

install-web: ## Install web package dependencies
	@echo "$(CYAN)Installing web dependencies...$(RESET)"
	@cd $(WEB_DIR) && npm install
	@echo "$(GREEN)✓ Web dependencies installed$(RESET)"

install-server: ## Install server package dependencies
	@echo "$(CYAN)Installing server dependencies...$(RESET)"
	@cd $(SERVER_DIR) && npm install
	@echo "$(GREEN)✓ Server dependencies installed$(RESET)"

# ------------------------------------------------------------------------------
# Development
# ------------------------------------------------------------------------------

##@ Development

dev: ## Start both web and server in development mode (concurrent)
	@echo "$(CYAN)Starting development servers...$(RESET)"
	@echo "$(YELLOW)Web:$(RESET)    http://localhost:5173"
	@echo "$(YELLOW)Server:$(RESET) http://localhost:3000"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@cd $(SERVER_DIR) && npm run dev & \
	 cd $(WEB_DIR) && npm run dev & \
	 wait

dev-web: ## Start only the web frontend (development)
	@echo "$(CYAN)Starting web development server...$(RESET)"
	@cd $(WEB_DIR) && npm run dev

dev-server: ## Start only the server backend (development)
	@echo "$(CYAN)Starting server development...$(RESET)"
	@cd $(SERVER_DIR) && npm run dev

dev-demo: ## Start web in demo mode (localStorage, no backend)
	@echo "$(CYAN)Starting web in demo mode...$(RESET)"
	@echo "$(YELLOW)Demo credentials:$(RESET) demo@simplestock.com / demo123456"
	@cd $(WEB_DIR) && npm run dev:demo

# ------------------------------------------------------------------------------
# Build
# ------------------------------------------------------------------------------

##@ Build

build: build-server build-web ## Build both packages for production
	@echo "$(GREEN)✓ All packages built$(RESET)"

build-web: ## Build web package for production
	@echo "$(CYAN)Building web package...$(RESET)"
	@cd $(WEB_DIR) && npm run build
	@echo "$(GREEN)✓ Web package built$(RESET)"

build-server: ## Build server package for production
	@echo "$(CYAN)Building server package...$(RESET)"
	@cd $(SERVER_DIR) && npm run build
	@echo "$(GREEN)✓ Server package built$(RESET)"

build-demo: ## Build web package in demo mode
	@echo "$(CYAN)Building web package (demo mode)...$(RESET)"
	@cd $(WEB_DIR) && npm run build:demo
	@echo "$(GREEN)✓ Web demo package built$(RESET)"

# ------------------------------------------------------------------------------
# Production
# ------------------------------------------------------------------------------

##@ Production

start: ## Start server in production mode (requires build first)
	@echo "$(CYAN)Starting production server...$(RESET)"
	@cd $(SERVER_DIR) && npm run start

preview: ## Preview web production build
	@echo "$(CYAN)Starting web preview server...$(RESET)"
	@cd $(WEB_DIR) && npm run preview

preview-demo: ## Preview web demo production build
	@echo "$(CYAN)Starting web demo preview server...$(RESET)"
	@cd $(WEB_DIR) && npm run preview:demo

# ------------------------------------------------------------------------------
# Code Quality
# ------------------------------------------------------------------------------

##@ Code Quality

lint: lint-web lint-server ## Run linting on all packages
	@echo "$(GREEN)✓ All linting complete$(RESET)"

lint-web: ## Run ESLint on web package
	@echo "$(CYAN)Linting web package...$(RESET)"
	@cd $(WEB_DIR) && npm run lint

lint-server: ## Run ESLint on server package
	@echo "$(CYAN)Linting server package...$(RESET)"
	@cd $(SERVER_DIR) && npm run lint

format: ## Format server code with Prettier
	@echo "$(CYAN)Formatting server code...$(RESET)"
	@cd $(SERVER_DIR) && npm run format
	@echo "$(GREEN)✓ Server code formatted$(RESET)"

# ------------------------------------------------------------------------------
# Testing
# ------------------------------------------------------------------------------

##@ Testing

test: ## Run web tests once
	@echo "$(CYAN)Running web tests...$(RESET)"
	@cd $(WEB_DIR) && npm run test

test-watch: ## Run web tests in watch mode
	@echo "$(CYAN)Starting web tests in watch mode...$(RESET)"
	@cd $(WEB_DIR) && npm run test:watch

test-coverage: ## Run web tests with coverage report
	@echo "$(CYAN)Running web tests with coverage...$(RESET)"
	@cd $(WEB_DIR) && npm run test:coverage

# ------------------------------------------------------------------------------
# Database & Seeding
# ------------------------------------------------------------------------------

##@ Database

seed-admin: ## Seed initial admin user (server)
	@echo "$(CYAN)Seeding admin user...$(RESET)"
	@cd $(SERVER_DIR) && npm run seed:admin
	@echo "$(GREEN)✓ Admin user seeded$(RESET)"

# ------------------------------------------------------------------------------
# Maintenance
# ------------------------------------------------------------------------------

##@ Maintenance

clean: clean-web clean-server ## Clean all build artifacts and dependencies
	@echo "$(GREEN)✓ All packages cleaned$(RESET)"

clean-web: ## Clean web build artifacts and node_modules
	@echo "$(CYAN)Cleaning web package...$(RESET)"
	@rm -rf $(WEB_DIR)/dist
	@rm -rf $(WEB_DIR)/node_modules
	@rm -rf $(WEB_DIR)/coverage
	@echo "$(GREEN)✓ Web package cleaned$(RESET)"

clean-server: ## Clean server build artifacts and node_modules
	@echo "$(CYAN)Cleaning server package...$(RESET)"
	@rm -rf $(SERVER_DIR)/dist
	@rm -rf $(SERVER_DIR)/node_modules
	@echo "$(GREEN)✓ Server package cleaned$(RESET)"

check: ## Check if required tools are installed
	@echo "$(CYAN)Checking required tools...$(RESET)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)✗ Node.js is not installed$(RESET)"; exit 1; }
	@echo "$(GREEN)✓ Node.js:$(RESET) $$(node --version)"
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)✗ npm is not installed$(RESET)"; exit 1; }
	@echo "$(GREEN)✓ npm:$(RESET)     $$(npm --version)"
	@echo "$(GREEN)✓ All required tools are installed$(RESET)"

status: ## Show project status (installed packages, etc.)
	@echo "$(BOLD)Project Status$(RESET)"
	@echo "$(CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo ""
	@echo "$(YELLOW)Web Package:$(RESET)"
	@if [ -d "$(WEB_DIR)/node_modules" ]; then \
		echo "  Dependencies: $(GREEN)installed$(RESET)"; \
	else \
		echo "  Dependencies: $(RED)not installed$(RESET)"; \
	fi
	@if [ -d "$(WEB_DIR)/dist" ]; then \
		echo "  Build:        $(GREEN)exists$(RESET)"; \
	else \
		echo "  Build:        $(YELLOW)not built$(RESET)"; \
	fi
	@echo ""
	@echo "$(YELLOW)Server Package:$(RESET)"
	@if [ -d "$(SERVER_DIR)/node_modules" ]; then \
		echo "  Dependencies: $(GREEN)installed$(RESET)"; \
	else \
		echo "  Dependencies: $(RED)not installed$(RESET)"; \
	fi
	@if [ -d "$(SERVER_DIR)/dist" ]; then \
		echo "  Build:        $(GREEN)exists$(RESET)"; \
	else \
		echo "  Build:        $(YELLOW)not built$(RESET)"; \
	fi
	@echo ""