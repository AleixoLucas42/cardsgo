#!/bin/bash

export $(cat .env | xargs)

echo "BRANCH: $(git branch | grep '*')"

#FILL DOCKER COMPOSE FILE WITH CREDENTIALS
sed -i "s/{password}/$mysql_psw/g" docker-compose.yaml

#NETWORK CREATE
docker network create cardsgo

#BUILD DOCKERFILE
docker build -t cardsgo . --quiet && echo "Docker build success" || echo "Docker build failed"

#START DATABASE CONTAINER
if [[ -d ./database/.mysql ]]; then
    docker compose up -d
    echo "Imported data success, folder exists"
else
    docker compose stop
    docker compose up -d
    echo "Waiting to import .sql to database"
    sleep 130 #SLEEP 130s
    Upload .sql file to database
    docker exec -i cardsgo-mysql mysql -uroot -p$mysql_psw mysql < ./database/create-db.sql && echo "Imported data success" || echo "Failed to import data to database container"
fi

#UNDO CREDENTIALS
sed -i "s/=$mysql_psw/={password}/g" docker-compose.yaml
