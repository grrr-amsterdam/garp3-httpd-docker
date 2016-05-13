FROM php:5.6-apache
MAINTAINER David Spreekmeester <david@grrr.nl>

ENV APPLICATION_ENV=development
#COPY src/* /var/www/html/
#ADD src /code
ADD docker/php.ini /usr/local/etc/php/
ADD docker/httpd.conf /etc/apache2/apache2.conf
#/etc/apache2/apache2.conf
#RUN cat /usr/local/apache2/conf/httpd.conf >> /etc/apache2/apache2.conf
# Even een test met een lokale package.json, die moet eigenlijk uit Entree komen.
#ADD package.json /var/www/html/entree

WORKDIR /var/www/html
#WORKDIR /var/www/html/entree

#RUN \
	# Link the host www directory into the Docker container
	#rm -rf /var/www/html && \
	#cd /var/www && \
	#ln -s /Users/david/Sites/entree html

RUN \
	# Update first
	apt-get -y update && \

	# Install MySql Improved
	apt-get -y install php5-mysql && \
	docker-php-ext-configure mysqli --with-mysqli && \
	docker-php-ext-install mysqli && \

	# Install Node & NPM
	apt-get -y install nodejs npm && \
	a2enmod rewrite
	#chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share} && \
	#chgrp -R www-data /var/www/html
	#chgrp -R www-data .

#RUN \
	# Run frontend dev tools
	#cd /var/www/html && \
	#ls . && \
	#npm install
	#gulp

#RUN apachectl graceful

EXPOSE 80
EXPOSE 3306 


#npm install -g n
#npm install -g gulp
#npm install -g bower
#npm install -g jshint

# Install ruby gems
#sudo gem install scss-lint
#sudo gem install semver
#sudo gem install capistrano

# Install python package manager
#wget https://bootstrap.pypa.io/get-pip.py
#sudo python get-pip.py

# Install aws cli tool
#sudo pip install awscli

