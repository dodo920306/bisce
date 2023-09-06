#!/bin/bash
DIR=$( echo "$0" | rev | cut -d'/' -f2- | rev )

if [ $# -ne 2 ]; then
  echo -e "Usage:\n    $0 <org_name> <user_name>"
  exit 1
fi

ORG=$1
USER=$2

if [ -e ${DIR}/users/${USER} ]; then
  echo "Error: Username already exists under the organization. Please try with another one." >&2
  exit 1
fi

export FABRIC_CFG_PATH=${DIR}/config
export FABRIC_CA_CLIENT_HOME=${DIR}

fabric-ca-client register --caname ca-${ORG} --id.name ${USER} --id.secret ${USER}pw --id.type client --tls.certfiles "${DIR}/fabric-ca/ca-cert.pem" 1>/dev/null
fabric-ca-client enroll -u https://${USER}:${USER}pw@localhost:7054 --caname ca-${ORG} -M "${DIR}/users/${USER}/msp" --tls.certfiles "${DIR}/fabric-ca/ca-cert.pem"
cp "${DIR}/msp/config.yaml" "${DIR}/users/${USER}/msp/config.yaml"

sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/${USER}/msp $(sudo docker ps --filter "name=^peer0.*" --format "{{.Names}}") /etc/hyperledger/application/token_erc_20 register
