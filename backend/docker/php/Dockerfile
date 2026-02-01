FROM php:8.3-fpm-alpine

# System deps required for extensions and building PECL packages
RUN apk add --no-cache \
    git \
    unzip \
    icu-dev \
    libzip-dev \
    postgresql-dev \
    sqlite-dev \
    libxml2-dev \
    curl-dev \
    oniguruma-dev \
    autoconf \
    build-base \
    $PHPIZE_DEPS

# Install PHP extensions used by the app and CI (pdo, pdo_pgsql, pdo_sqlite,
# intl, zip, mbstring, xml, curl)
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pdo_sqlite \
    intl \
    zip \
    mbstring \
    xml \
    curl

# Install PCOV for PHPUnit coverage (lighter than Xdebug)
RUN pecl install pcov \
    && docker-php-ext-enable pcov \
    && echo "pcov.enabled=1" > /usr/local/etc/php/conf.d/pcov.ini \
    && echo "pcov.directory=/var/www/html" >> /usr/local/etc/php/conf.d/pcov.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html