FROM php:5.6-apache
MAINTAINER David Spreekmeester <david@grrr.nl>

ENV APPLICATION_ENV=development
RUN mkdir -p /var/www/html/public
ADD docker/php.ini /usr/local/etc/php/
ADD docker/httpd.conf /etc/apache2/apache2.conf

WORKDIR /var/www/html

RUN \
	# Update first
	apt-get -y update && \

	# Basics
	apt-get -y install apt-utils wget && \

	# Install MySql Improved
	apt-get -y install php5-mysql && \
	docker-php-ext-install pdo_mysql && \

	# Install Node 4.x & NPM
	wget -qO- https://deb.nodesource.com/setup_4.x | bash - && \
	apt-get -y install nodejs && \

	# Install mod_rewrite on Apache
	a2enmod rewrite && \

	# Install ruby gems
	apt-get -y install ruby rubygems-integration && \
	gem install scss-lint && \
	gem install semver && \

	npm i -g gulp && \
	npm i -g bower && \
	npm i -g jshint

EXPOSE 80

# ----------- SOMEDAY
#sudo gem install capistrano

# Install python package manager
#wget https://bootstrap.pypa.io/get-pip.py
#sudo python get-pip.py

# Install aws cli tool
#sudo pip install awscli
