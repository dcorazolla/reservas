# Makefile for developer convenience (CI parity)

.PHONY: build test test-docker install

build:
	docker-compose build --no-cache app

install:
	# Install PHP deps inside the app container (mounted volume)
	docker-compose run --rm app sh -lc "cd /var/www/html && composer install --no-interaction --prefer-dist"

test:
	# Run tests locally using composer script
	cd backend/src && composer test

test-ci:
	# Run CI-style tests (phpdbg + clover) locally
	cd backend/src && composer test:ci

test-docker: build
	# Run tests in the built container (CI parity)
	docker-compose run --rm app sh -lc "cd /var/www/html && composer test:ci"
