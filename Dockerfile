FROM php:5.6-apache
MAINTAINER David Spreekmeester <david@grrr.nl>

ENV APPLICATION_ENV=development
COPY src/* /var/www/html/
ADD src /code

WORKDIR /var/www/html

RUN apt-get -y update && \
	apt-get -y install php5-mysql && \
	docker-php-ext-configure mysqli --with-mysqli && \
	docker-php-ext-install mysqli

EXPOSE 80
EXPOSE 3306 
