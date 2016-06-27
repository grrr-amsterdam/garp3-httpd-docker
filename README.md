# Garp 3 webserver Docker setup
This is a webserver setup for Docker, to enable running a Garp 3 site out of the box.
For instance, on your local development machine.

Garp 3 is a PHP based platform, originating from Grrr in Amsterdam.

You can use it with Docker Compose, or standalone.
The Docker Compose route is practical when also running a database setup.

Repository name on Docker Hub: `grrrnl/garp3`

Example of a `docker-compose.yml` file in your project:
```
version: '2'
services:
  web:
    image: grrrnl/garp3
    ports:
      - "80:80"
    depends_on:
      - db
    volumes:
      - .:/var/www/html
    privileged: true
  db:
    image: orchardup/mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: my_database
```
