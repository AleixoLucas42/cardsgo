#!/bin/bash

export $(cat .env | xargs)

#FILL DOCKER COMPOSE FILE WITH CREDENTIALS
sed -i "s/{password}/$mysql_psw/g" docker-compose.yaml

#NETWORK CREATE
docker network create cardsgo

#BUILD DOCKERFILE
docker build -t cardsgo . --quiet && echo "Docker build success" || echo "Docker build failed"

#STOPPING CONTAINERS
docker container ls | cut -d " " -f1 | grep -v CONTAINER | while read container
do
    echo "Stopping container $container"
done

#START DATABASE CONTAINER
if [[ -d ./database/.mysql ]]; then
    docker-compose up -d && echo "Started database container" || echo "Failed to start database container"
    echo "Imported data success, folder exists"
else
    docker-compose up -d && echo "Waiting to import data to database container" || echo "Failed to start database container"
    sleep 100 #SLEEP 100s
    docker exec -i cardsgo-mysql mysql -uroot -p$mysql_psw mysql < ./database/create-db.sql && echo "Imported data success" || echo "Failed to import data to database container"
fi

#UNDO CREDENTIALS
sed -i "s/=$mysql_psw/={password}/g" docker-compose.yaml

while true; do sleep 60; git pull -C /home/ubuntu/cardsgo; done