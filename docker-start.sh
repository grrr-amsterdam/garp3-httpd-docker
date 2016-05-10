docker build -t garp-instance .
docker run --rm -p 80:80 -p 443:443 piuma/centos7-apache-php &
