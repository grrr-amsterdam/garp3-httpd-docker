# Garp 3 webserver Docker setup
[![](https://images.microbadger.com/badges/version/grrrnl/garp3-httpd.svg)](http://microbadger.com/images/grrrnl/garp3-httpd)
[![](https://images.microbadger.com/badges/image/grrrnl/garp3-httpd.svg)](http://microbadger.com/images/grrrnl/garp3-httpd)

This is a webserver setup for Docker, to enable running a Garp 3 site out of the box.
For instance, on your local development machine.

Garp 3 is a PHP based platform, originating from Grrr in Amsterdam.

You can use it with Docker Compose, or standalone.
The Docker Compose route is practical when also running a database setup.
Next to the runtime, it also provides tools and dependencies for building and deployment.

Repository on Docker Hub: [https://hub.docker.com/r/grrrnl/garp3-httpd/](`grrrnl/garp3`)

Example of a `docker-compose.yml` file in your project:
```
version: '2'
services:
  web:
    image: grrrnl/garp3-httpd
    ports:
      - "80:80"
    depends_on:
      - db
    volumes:
      - .:/var/www/html
    privileged: true
  db:
    image: grrrnl/garp3-db
    ports:
      - "3306:3306"
    restart: always
    volumes_from:
      - dbdata
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: my_database
      MYSQL_USER: my_db_user
      MYSQL_PASSWORD: my_db_pass
  dbdata:
    image: grrrnl/garp3-data
    volumes:
      - ./application/data/docker:/var/lib/mysql
```
