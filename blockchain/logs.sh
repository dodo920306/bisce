#!/bin/bash

docker-compose -f docker-compose.yaml -f docker-compose-ca.yaml logs -f
