#!/usr/bin/env bash

set -e

if [ ! "$(docker ps | grep knexpg)" ]; then
  docker run \
    --name knexpg \
    --publish 5432:5432 \
    --detach \
    -e POSTGRES_DB=knex_test \
    postgres
fi

if [ ! "$(docker ps | grep knexmysql)" ]; then
  docker run \
    --name knexmysql \
    --publish 3306:3306 \
    --detach \
    -e MYSQL_ALLOW_EMPTY_PASSWORD=true \
    -e MYSQL_DATABASE=knex_test \
    mysql
fi
