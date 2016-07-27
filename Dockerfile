FROM php:5.6-apache
MAINTAINER David Spreekmeester <david@grrr.nl>

ENV APPLICATION_ENV=development

# Export $TERM explicitly to prevent some problems with Fish shell
ENV TERM dumb
# Add PHP Composer path to current path
ENV PATH $PATH:./vendor/bin

ADD docker/php.ini /usr/local/etc/php/
ADD docker/httpd.conf /etc/apache2/apache2.conf
ADD g /bin/

WORKDIR /var/www/html

RUN \
    # Create document root directory.
    mkdir -p /var/www/html/public && \

    # Make sure we can call the 'g' alias to the Garp CLI entrypoint,
    # even from outside the container.
    chmod +x /bin/g && \

    # Update first
    apt-get -y update && \

    # Install Fish shell for Debian 7.x
    apt-key adv --keyserver keyserver.ubuntu.com --recv-key D880C8E4 && \
    echo 'deb http://download.opensuse.org/repositories/shells:/fish:/release:/2/Debian_7.0/ ./' \
        > /etc/apt/sources.list.d/fish-shell.list && \
    apt-get -y update && \
    apt-get -y install fish && \

    # Basics
    apt-get -y install apt-utils wget && \

    # PHP GD library
    apt-get -y install \
        libpng12-dev \
        libjpeg-dev \
        php5-gd && \
    docker-php-ext-configure gd --with-jpeg-dir=/usr/lib && \
    docker-php-ext-install gd && \

    # Enable Apache's mod_include for Server Side Includes
    cp /etc/apache2/mods-available/include.load /etc/apache2/mods-enabled/ && \

    # Install MySql Improved
    apt-get -y install php5-mysql && \
    docker-php-ext-install pdo_mysql && \

    # Install general MySQL client for easy access to db container
    apt-get -y install mysql-client && \

    # Install Node 6.x & NPM
    wget -qO- https://deb.nodesource.com/setup_6.x | bash - && \
    apt-get -y install nodejs && \

    # Install mod_rewrite on Apache
    a2enmod rewrite && \

    # Install ruby gems
    apt-get -y install ruby rubygems-integration && \
    gem install scss-lint && \
    gem install semver && \

    npm i -g gulp && \
    npm i -g bower && \
    npm i -g jshint && \

    # Deploy tools
    gem install capistrano && \

    # Install python package manager
    apt-get -y install python python-pip && \

    # Install aws cli tool
    pip install awscli
EXPOSE 80
