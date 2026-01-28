FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    git \
    unzip \
    icu-dev \
    libzip-dev \
    mysql-client \
    autoconf \
    build-base

RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    intl \
    zip

# Install and enable Redis PHP extension
RUN pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
