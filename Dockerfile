#FROM centos/php-56-centos7
#FROM php:5.6-apache
FROM piuma/centos7-apache-php
MAINTAINER David Spreekmeester <david@grrr.nl>

ENV APPLICATION_ENV=development

RUN rpm -Uvh https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm && rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm

#RUN yum -y install yum-plugin-replace
#RUN yum -y replace php-common --replace-with=php56w-common

WORKDIR /usr/local/src
COPY src/* /var/www/html/
CMD [ "php", "test.php" ]
#CMD [ "php", "./src/test.php" ]

#COPY package.json /usr/local/src/package.json
#COPY start.sh /start.sh
#RUN npm install

#RUN yum install apache 
#RUN yum -y install nodejs npm
#RUN yum update 
#RUN yum -y install sudo
#RUN sudo yum -y install npm


#COPY gulpfile.js /usr/local/src/gulpfile.js
#COPY .babelrc /usr/local/src/.babelrc
#COPY src /usr/local/src/src
#RUN npm run compile

EXPOSE 8877

#CMD /start.sh
