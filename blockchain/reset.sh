#!/bin/bash

set -x

sudo docker-compose -f docker-compose-ca.yaml down
sudo docker-compose -f docker-compose.yaml down

set +x
