FROM php:8.2-cli

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libzip-dev \
    libpq-dev \
    libonig-dev \
    libicu-dev \
    zlib1g-dev \
    libxml2-dev \
    curl \
    ca-certificates \
    build-essential \
  && docker-php-ext-configure zip \
  && docker-php-ext-install -j$(nproc) pdo_pgsql mbstring intl bcmath xml zip \
  && pecl install pcov \
  && docker-php-ext-enable pcov \
  && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Composer (copy from official composer image)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Enable PCOV and configure to scan the app directory by default
RUN printf "%s\n" \
  "pcov.enabled=1" \
  "pcov.directory=/var/www/html" \
  "pcov.exclude=^/vendor/" \
  > /usr/local/etc/php/conf.d/pcov.ini

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

