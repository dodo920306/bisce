#!/bin/bash

set -x

sudo rm -rf fabric-ca/ peercfg/ msp/ ca/ tlsca/ users/ orderers/ bin/ builders/ config/ peers/ fabric/ deliver/
sudo docker-compose -f docker-compose-ca.yaml down
sudo docker-compose -f docker-compose.yaml down
sudo docker volume rm peer0
sudo docker volume rm orderer0
sudo rm -f .env.ca docker-compose-ca.yaml fabric-ca-client-config.yaml docker-compose.yaml .env.peer .env.couchdb .env.orderer install-fabric.sh *.block *.pb *.json connection* setup.sh createChannel.sh *.tar.gz fetchBlock/*.json

set +x
