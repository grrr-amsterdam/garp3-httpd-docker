eval (docker-machine env default)
docker build -t garp-instance .
docker stop garp3
docker rm garp3
docker run --rm --sig-proxy=false --name garp3 -p 80:80 -p 443:443 piuma/centos7-apache-php &
