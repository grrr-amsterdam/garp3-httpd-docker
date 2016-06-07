eval (docker-machine env default)
#docker build -t grrr-amsterdam/garp3-docker .
#docker stop garp3
#docker rm garp3
docker-compose up -d
#docker run -d --sig-proxy=false --name garp3 \
	#-v /Users/david/Sites/entree/application/data/mysql_data:/var/lib/mysql \
	#-p 80:80 \
	#-p 443:443 \
	#-p 3306:3306 \
	#grrr-amsterdam/garp3-docker &
