FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    git \
    unzip \
    icu-dev \
    libzip-dev \
    postgresql-dev \
    autoconf \
    build-base \
    $PHPIZE_DEPS

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    intl \
    zip

# Install PCOV for PHPUnit coverage (lighter than Xdebug)
RUN pecl install pcov \
    && docker-php-ext-enable pcov \
    && echo "pcov.enabled=1" > /usr/local/etc/php/conf.d/pcov.ini \
    && echo "pcov.directory=/var/www/html" >> /usr/local/etc/php/conf.d/pcov.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html