FROM php:5.6-apache
MAINTAINER David Spreekmeester <david@grrr.nl>

ENV APPLICATION_ENV=development

# Export $TERM explicitly to prevent some problems with Fish shell
ENV TERM linux
# Add PHP Composer path to current path
ENV PATH $PATH:./vendor/bin

ADD docker/php.ini /usr/local/etc/php/
ADD docker/httpd.conf /etc/apache2/apache2.conf

WORKDIR /var/www/html

RUN \
    # Create document root directory.
    mkdir -p /var/www/html/public && \

    # Update first
    apt -y update && \

    # Install Fish shell for Debian 8.x
    apt-key adv --keyserver keyserver.ubuntu.com --recv-key D880C8E4 && \
    echo 'deb http://download.opensuse.org/repositories/shells:/fish:/release:/2/Debian_8.0/ ./' \
        > /etc/apt/sources.list.d/fish-shell.list && \
    apt -y update && \
    apt -y install fish && \

    # Basics
    apt -y install apt-utils wget git vim && \

    # PHP GD library
    apt -y install \
        libpng12-dev \
        libjpeg-dev \
        php5-gd && \
    docker-php-ext-configure gd --with-jpeg-dir=/usr/lib && \
    docker-php-ext-install gd && \

    # LibSSH2 and SSH client, for content syncing
    apt -y install libssh2-1 libssh2-1-dev openssh-client && \
    yes | pecl install ssh2 && \
    docker-php-ext-enable ssh2 && \

    # Enable Apache's mod_include for Server Side Includes
    cp /etc/apache2/mods-available/include.load /etc/apache2/mods-enabled/ && \

    # Install MySql Improved
    apt -y install php5-mysql && \
    docker-php-ext-install pdo_mysql && \

    # Install general MySQL client for easy access to db container
    apt -y install mysql-client && \

    # Install Node 6.x & NPM
    wget -qO- https://deb.nodesource.com/setup_6.x | bash - && \
    apt -y install nodejs && \

    # Install mod_rewrite on Apache
    a2enmod rewrite && \

    # Install ruby gems
    apt -y install ruby rubygems-integration && \
    gem install scss-lint && \
    gem install semver && \

    npm i -g gulp && \
    npm i -g bower && \
    npm i -g jshint && \

    # Deploy tools
    gem install capistrano && \

    # Install python package manager
    apt -y install python python-pip && \

    # Install aws cli tool
    pip install awscli
EXPOSE 80
