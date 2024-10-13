#!/bin/bash

exportEnvVar() {
    set -a
    . .env
    HOST=`hostname`
    PWD=`pwd`
    FABRIC_CFG_PATH="${PWD}/config"
    FABRIC_CA_CLIENT_HOME="${PWD}"
    CORE_PEER_TLS_ENABLED=true
    CORE_PEER_LOCALMSPID="${ORG}MSP"
    CORE_PEER_TLS_ROOTCERT_FILE="${PWD}/peers/peer0/tls/ca.crt"
    CORE_PEER_MSPCONFIGPATH="${PWD}/users/bisce/msp"
    CORE_PEER_ADDRESS="${HOST}:7051"
    set +a
}

init()
{
    echo -e "\033[0;32m                      .coo;
                   .;looooooc,.
               .,coooooooooooooo:'
            .:oooooooooooooooooooool;.
        .,looooooooooooooooooooooooooooc'.
    .':oooooooooooooooooooooooooooooooooool;.
 .;looooooooooooooooooooooooooooooooooooooooooc,.
;ooooooooooooooooool;;looooc;:ooooooooooooooooooo.
loooooooooooooooool    ;;;    'oooooooooooooooooo;
oooooooooooooo:::,.            .;::cooooooooooooo;            ........            ...            ..'''..             ..'''..          ..........
ooooooooooooo.     .;:'''''';.     ,ooooooooooooo;            lo:''',lo:          'oc          ;oc,..,:o          'co:,''';lo        .oo,''''','
ooooooooooooo,   'l.  .       ,c.   loooooooooooo:            co.     lo'         'oc         ;o;                :o;                 .ol
ooooooooooool.  ,l   ;ol,.     .o.  ,oooooooooooo:            co.    .oo.         .o:         ,oc.              'oc                  .ol
ooooooooool.    o.   'ooolo:    ::    'oooooooooo:            co:,,,:o:.          .o:          .col;'.          co,                  .ol,,,,,,. 
ooooooooool.    o.    cool'..   ::    'oooooooooo:            co,....,cl,         .o:             .,col'        co,                  .ol......
ooooooooooool.  'l     .'',c   .o.  ;oooooooooooo:            co.      co,        .o:                 co;       ,ol                  .oc
ooooooooooooo,   'l'       .. ;c.   coooooooooooo:            co.      lo'        .o:         .       ;o,        co:        .        .oc
ooooooooooooo.     '::,,,,,,:;.     ,oooooooooooo;            lo:'',,:oc'         'o:         ol;''',ll'          'lo:,'',;ll        .ol,,,,,,,,
ooooooooooooooc::;.            .;::cooooooooooooo;            ........             ..          ...'...               ..''..           ..........
loooooooooooooooooo    ...    'oooooooooooooooooo;
;ooooooooooooooooooo::looooc;cooooooooooooooooooo.
 .,looooooooooooooooooooooooooooooooooooooooooc'
     ':oooooooooooooooooooooooooooooooooool;.
        .,coooooooooooooooooooooooooooo:'.
            .;looooooooooooooooooool,.
               .':oooooooooooool;.
                   .,coooooo:'.
                      .coo;\033[0m"
    if [[ -n "${ORG}" ]]; then
        echo -e "The name of your organization is \e[1;31m${ORG}\e[0m."
        while true; do
            read -p "Can you confirm that this is correct? (Y/n) " confirm
            if [[ "$confirm" == "Y" || "$confirm" == "n" ]]; then
                break
            else
                echo "Invalid input. Please enter 'Y' or 'n'." >&2
            fi
        done
    else
        echo "Error: environment variable 'ORG' doesn't have a value." >&2
        exit -1
    fi
    
    if [[ "$confirm" == "Y" ]]; then
        if [[ ! $ORG =~ ^[a-zA-Z0-9]+$ ]]; then
            echo "Error: The value of 'ORG' shouldn't include characters that are not letters and numbers." >&2
            exit -2
        fi
    elif [[ "$confirm" == "n" ]]; then
        echo "Initialization Cancelled by the user."
        exit 0
    else
        echo "Error: Unknown Error" >&2
        exit -3
    fi

    if [[ -n "${HOST}" ]]; then
        echo -e "The hostname of your BISCE is \e[1;31m${HOST}\e[0m."
        while true; do
            read -p "Can you confirm that this is correct? (Y/n) " confirm
            if [[ "$confirm" == "Y" || "$confirm" == "n" ]]; then
                break
            else
                echo "Invalid input. Please enter 'Y' or 'n'." >&2
            fi
        done
    else
        echo "Error: environment variable 'HOST' doesn't have a value." >&2
        exit -1
    fi
    
    if [[ "$confirm" == "Y" ]]; then
        if [[ ! $ORG =~ ^[a-zA-Z0-9.]+$ ]]; then
            echo "Error: The value of 'HOST' shouldn't include characters that are not letters, dots, and numbers." >&2
            exit -2
        else
            echo "Welcome ${ORG}!"
        fi
    elif [[ "$confirm" == "n" ]]; then
        echo "Initialization Cancelled by the user."
        exit 0
    else
        echo "Error: Unknown Error" >&2
        exit -3
    fi

    curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
    ./install-fabric.sh --fabric-version 3.0.0 binary
    sudo cp bin/* /usr/local/bin/
    rm -f install-fabric.sh
    rm -rf builders
    rm -rf bin

    echo "Initiation starts."

    docker volume create orderer0
    docker volume create peer0

    mkdir config 2>/dev/null
    mkdir fabric-ca 2>/dev/null

    envsubst '${ORG} ${HOST} ${PWD}' < template/configtx.template.yaml > config/configtx.yaml
    envsubst '${ORG} ${HOST}' < template/fabric-ca-server-config.template.yaml > fabric-ca/fabric-ca-server-config.yaml
    envsubst '${ORG}' < template/fabric-ca-client-config.template.yaml > fabric-ca-client-config.yaml

    echo "Initiation completed."
}

setup()
{
    echo "Setup starts."

    docker compose -f docker-compose-ca.yaml up -d
    sleep 5
    HTTP_STATUS=$(curl -X GET -s -o /dev/null -w "%{http_code}" http://localhost:17054/healthz)
    if [ "$HTTP_STATUS" -ne 200 ]; then
        echo "Fabric CA Server is not healthy (HTTP $HTTP_STATUS). Retrying in 5 seconds..."
        sleep 5
        HTTP_STATUS=$(curl -X GET -s -o /dev/null -w "%{http_code}" http://localhost:17054/healthz)
        if [ "$HTTP_STATUS" -ne 200 ]; then
            echo "Fabric CA Server is unhealthy, exiting."
            exit -6
        fi
    fi

    echo "Fabric CA Server is healthy."
    echo "create Fabric CA Client user"
    if ! fabric-ca-client identity list --id caadmin --tls.certfiles fabric-ca/ca-cert.pem 1>/dev/null 2>/dev/null; then
        fabric-ca-client enroll \
            -u https://caadmin:caadminpw@localhost:7054 \
            --caname "ca-${ORG}" --tls.certfiles fabric-ca/ca-cert.pem
        echo "NodeOUs:
        Enable: true
        ClientOUIdentifier:
            Certificate: cacerts/localhost-7054-ca-${ORG}.pem
            OrganizationalUnitIdentifier: client
        PeerOUIdentifier:
            Certificate: cacerts/localhost-7054-ca-${ORG}.pem
            OrganizationalUnitIdentifier: peer
        AdminOUIdentifier:
            Certificate: cacerts/localhost-7054-ca-${ORG}.pem
            OrganizationalUnitIdentifier: admin
        OrdererOUIdentifier:
            Certificate: cacerts/localhost-7054-ca-${ORG}.pem
            OrganizationalUnitIdentifier: orderer" > msp/config.yaml

        mkdir msp/tlscacerts 2>/dev/null
        mkdir tlsca 2>/dev/null
        mkdir ca 2>/dev/null

        cp fabric-ca/ca-cert.pem msp/tlscacerts/ca.crt
        cp fabric-ca/ca-cert.pem tlsca/tlsca-cert.pem
        cp fabric-ca/ca-cert.pem ca/ca-cert.pem
    else
        echo "Fabric CA Client user exists. omit"
    fi

    echo "create Order0 user"
    if ! fabric-ca-client identity list --id orderer0 --tls.certfiles fabric-ca/ca-cert.pem 1>/dev/null 2>/dev/null; then
        fabric-ca-client register \
            --caname "ca-${ORG}" \
            --id.name orderer0 \
            --id.secret orderer0pw \
            --id.type orderer \
            --tls.certfiles fabric-ca/ca-cert.pem 1>/dev/null 2>/dev/null
        fabric-ca-client enroll \
            -u https://orderer0:orderer0pw@localhost:7054 \
            --caname "ca-${ORG}" \
            -M orderers/orderer0/msp \
            --tls.certfiles fabric-ca/ca-cert.pem

        cp msp/config.yaml orderers/orderer0/msp/config.yaml

        fabric-ca-client enroll \
            -u https://orderer0:orderer0pw@localhost:7054 \
            --caname "ca-${ORG}" \
            -M orderers/orderer0/tls \
            --enrollment.profile tls \
            --csr.hosts localhost \
            --csr.hosts "${HOST}" \
            --tls.certfiles fabric-ca/ca-cert.pem

        cp "orderers/orderer0/tls/tlscacerts/tls-localhost-7054-ca-${ORG}.pem" orderers/orderer0/tls/ca.crt
        cp orderers/orderer0/tls/signcerts/cert.pem orderers/orderer0/tls/server.crt
        cp orderers/orderer0/tls/keystore/* orderers/orderer0/tls/server.key

        mkdir orderers/orderer0/msp/tlscacerts 2>/dev/null
        cp "orderers/orderer0/tls/tlscacerts/tls-localhost-7054-ca-${ORG}.pem" orderers/orderer0/msp/tlscacerts/tlsca-cert.pem
    else
        echo "Order0 user exists. omit"
    fi

    echo "create Peer0 user"
    if ! fabric-ca-client identity list --id peer0 --tls.certfiles fabric-ca/ca-cert.pem 1>/dev/null 2>/dev/null; then
        fabric-ca-client register \
            --caname "ca-${ORG}" \
            --id.name peer0 \
            --id.secret peer0pw \
            --id.type peer \
            --tls.certfiles fabric-ca/ca-cert.pem 1>/dev/null
        fabric-ca-client enroll \
            -u https://peer0:peer0pw@localhost:7054 \
            --caname "ca-${ORG}" \
            -M peers/peer0/msp \
            --tls.certfiles fabric-ca/ca-cert.pem

        cp msp/config.yaml peers/peer0/msp/config.yaml

        fabric-ca-client enroll \
            -u https://peer0:peer0pw@localhost:7054 \
            --caname "ca-${ORG}" \
            -M peers/peer0/tls \
            --enrollment.profile tls \
            --csr.hosts localhost \
            --csr.hosts "${HOST}" \
            --tls.certfiles fabric-ca/ca-cert.pem

        cp "peers/peer0/tls/tlscacerts/tls-localhost-7054-ca-${ORG}.pem" peers/peer0/tls/ca.crt
        cp peers/peer0/tls/signcerts/cert.pem peers/peer0/tls/server.crt
        cp peers/peer0/tls/keystore/* peers/peer0/tls/server.key
    else
        echo "Peer0 user exists. omit"
    fi

    echo "create Bisce user"
    if ! fabric-ca-client identity list --id bisce --tls.certfiles fabric-ca/ca-cert.pem 1>/dev/null 2>/dev/null; then
        fabric-ca-client register \
            --caname "ca-${ORG}" \
            --id.name bisce \
            --id.secret biscepw \
            --id.type admin \
            --tls.certfiles fabric-ca/ca-cert.pem 1>/dev/null
        fabric-ca-client enroll \
            -u https://bisce:biscepw@localhost:7054 \
            --caname "ca-${ORG}" \
            -M users/bisce/msp \
            --tls.certfiles fabric-ca/ca-cert.pem

        cp msp/config.yaml users/bisce/msp/config.yaml
    else
        echo "Bisce user exists. omit"
    fi

    docker compose -f docker-compose.yaml up -d

    echo "Setup completed."
}

reset()
{
    echo "Reset starts."
    docker compose -f docker-compose-ca.yaml down
    docker compose -f docker-compose.yaml down
    echo "Reset completed."
}

uninit()
{
    echo "Uninit starts"
    sudo rm -rf fabric-ca/ peercfg/ msp/ ca/ tlsca/ users/ orderers/ bin/ builders/ config/ peers/ fabric/ deliver/
    docker compose -f docker-compose-ca.yaml down
    docker compose -f docker-compose.yaml down
    docker volume rm peer0
    docker volume rm orderer0
    sudo rm -f fabric-ca-client-config.yaml install-fabric.sh *.block *.pb *.json connection* *.tar.gz fetchBlock/*.json
    echo "Uninit completed"
}

createChannel()
{
    echo "Creation of the channel starts."
    configtxgen -profile Bisce -outputBlock config_block.pb -channelID "${CHANNEL}"
    osnadmin channel join \
        --channelID "${CHANNEL}" \
        --config-block config_block.pb \
        -o "${HOST}:7053" \
        --ca-file tlsca/tlsca-cert.pem \
        --client-cert orderers/orderer0/tls/server.crt \
        --client-key orderers/orderer0/tls/server.key
    peer channel join \
        -b config_block.pb
    rm config_block.pb

    envsubst '${ORG} ${HOST} ${CHANNEL}' \
        < template/config_update_in_envelope.template.json \
        > config_update_in_envelope.json
    configtxlator proto_encode \
        --input config_update_in_envelope.json \
        --type common.Envelope \
        --output config_update_in_envelope.pb
    rm config_update_in_envelope.json
    # wait for peer leader election
    sleep 5
    peer channel update \
        -f config_update_in_envelope.pb \
        -c "${CHANNEL}" \
        -o "${HOST}:7050" \
        --tls \
        --cafile "${PWD}/peers/peer0/tls/ca.crt"
    if [ $? -ne 0 ]; then
        echo "Update config failed, retrying in 5 seconds..."
        sleep 5
        peer channel update \
            -f config_update_in_envelope.pb \
            -c "${CHANNEL}" \
            -o "${HOST}:7050" \
            --tls \
            --cafile "${PWD}/peers/peer0/tls/ca.crt"
        if [ $? -ne 0 ]; then
            echo "Update config failed again, exiting."
            exit -5
        fi
    fi
    rm config_update_in_envelope.pb
    mkdir -p channels/${CHANNEL}/orgRequest
    mkdir channels/${CHANNEL}/proposal

    echo "Creation of the channel completed."
}

applyForJoiningChannel()
{
    echo "Application for joining the channel starts."
    mkdir channels/${CHANNEL}/orgRequests/${ORG}
    touch channels/${CHANNEL}/orgRequests/${ORG}/.env
    echo "HOST=${HOST}" > channels/${CHANNEL}/orgRequests/${ORG}/.env
    echo "CERT=$(base64 orderers/orderer0/tls/server.crt | tr -d '\n')" >> channels/${CHANNEL}/orgRequests/${ORG}/.env
    configtxgen -printOrg ${ORG} > ${ORG}.json
    mv ${ORG}.json channels/${CHANNEL}/orgRequests/${ORG}/${ORG}.json
    echo "Application for joining the channel completed."
}

joinChannel()
{
    osnadmin channel join \
        --channelID ${CHANNEL} \
        --config-block "channels/${CHANNEL}/${CHANNEL}.block" \
        -o "${HOST}:7053" \
        --ca-file tlsca/tlsca-cert.pem \
        --client-cert orderers/orderer0/tls/server.crt \
        --client-key orderers/orderer0/tls/server.key
    peer channel join -b "channels/${CHANNEL}/${CHANNEL}.block"
}

listChannel()
{
    osnadmin channel list \
        -o "${HOST}:7053" \
        --ca-file tlsca/tlsca-cert.pem \
        --client-cert orderers/orderer0/tls/server.crt \
        --client-key orderers/orderer0/tls/server.key
    osnadmin channel list \
        --channelID ${CHANNEL} \
        -o "${HOST}:7053" \
        --ca-file tlsca/tlsca-cert.pem \
        --client-cert orderers/orderer0/tls/server.crt \
        --client-key orderers/orderer0/tls/server.key
    peer channel list
}

if [[ $# -lt 1 ]] ; then
    echo "Error: no action is given" >&2
    exit -4
else
    MODE=$1
    shift
fi

exportEnvVar

case "$MODE" in
    init )
        init
        ;;
    setup )
        setup
        ;;
    reset )
        reset
        ;;
    uninit )
        uninit
        ;;
    createChannel )
        createChannel
        ;;
    applyForJoiningChannel )
        applyForJoiningChannel
        ;;
    joinChannel )
        joinChannel
        ;;
    listChannel )
        listChannel
        ;;
    * )
        echo "Error: no such action" >&2
        exit -5
esac
