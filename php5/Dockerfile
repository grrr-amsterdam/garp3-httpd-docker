FROM php:5.6-apache
MAINTAINER David Spreekmeester <david@grrr.nl>

ENV APPLICATION_ENV=development
ENV TERM linux

# Add PHP Composer path to current path
ENV PATH $PATH:./vendor/bin
ENV COMPOSER_ALLOW_SUPERUSER 1

ADD config/php.ini /usr/local/etc/php/
ADD config/httpd.conf /etc/apache2/apache2.conf
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

RUN \
    # Create document root directory.
    mkdir -p /var/www/html/public && \
    # Update first
    apt-get -y update && \
    # Basics
    apt-get -y install apt-utils wget && \
    # PHP GD library
    apt-get -y install \
        libpng-dev \
        libjpeg-dev && \
    docker-php-ext-configure gd --with-jpeg-dir=/usr/lib && \
    docker-php-ext-install gd && \
    # Install MySql
    docker-php-ext-install pdo_mysql && \
    # Install mod_rewrite on Apache
    a2enmod rewrite

EXPOSE 80
