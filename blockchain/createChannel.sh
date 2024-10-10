#!/bin/bash

# while true;
# do
#     echo -n "Enter your channel's name: "
#     read CHANNEL
#     if [[ ! $CHANNEL =~ ^[a-z0-9]+$ ]]; then
#       echo "The name shouldn't include characters that are not lowercase letters and numbers."
#       continue
#     fi
#     echo -n -e "The name you enter is \e[1;31m${CHANNEL}\e[0m. This name can't be changed once channel created. Can you confirm that this is correct? (y/n)"
#     read confirm
#     if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
#       break
#     fi
# done

CHANNEL=biscechannel1
export FABRIC_CFG_PATH="${PWD}/config"
set -x

echo "Waiting for chaincode to be installed. This could take for a while..."
peer lifecycle chaincode package bisce.tar.gz --path $PWD/chaincode --lang golang --label bisce_1.0
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer lifecycle chaincode install /etc/hyperledger/bisce.tar.gz
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer lifecycle chaincode queryinstalled --output json
export CC_PACKAGE_ID=`sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer lifecycle chaincode queryinstalled --output json | jq '.installed_chaincodes[0].package_id'`
echo "${CC_PACKAGE_ID//\"/}"
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer lifecycle chaincode approveformyorg -o orderer0.${HOST}:7050 --channelID "${CHANNEL}" --name bisce --version 1.0 --package-id "${CC_PACKAGE_ID//\"/}" --sequence 1 --tls --cafile /etc/hyperledger/peers/peer0/tls/ca.crt
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer lifecycle chaincode checkcommitreadiness --channelID "${CHANNEL}" --name bisce --version 1.0 --sequence 1 --tls --cafile /etc/hyperledger/peers/peer0/tls/ca.crt --output json
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer lifecycle chaincode commit -o orderer0.${HOST}:7050 --channelID "${CHANNEL}" --name bisce --version 1.0 --sequence 1 --tls --cafile /etc/hyperledger/peers/peer0/tls/ca.crt --peerAddresses peer0.${HOST}:7051 --tlsRootCertFiles /etc/hyperledger/peers/peer0/tls/ca.crt
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer lifecycle chaincode querycommitted --channelID "${CHANNEL}" --name bisce
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer chaincode invoke -o orderer0.${HOST}:7050 --tls --cafile /etc/hyperledger/peers/peer0/tls/ca.crt --peerAddresses peer0.${HOST}:7051 --tlsRootCertFiles /etc/hyperledger/peers/peer0/tls/ca.crt -C "${CHANNEL}" -n bisce -c '{"function":"Initialize","Args":["Carbon Token", "CT", "2"]}'

echo "Update the deliver file"
mkdir deliver
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer channel fetch 0 /etc/hyperledger/deliver/genesis.block -c "${CHANNEL}"
echo "Waiting here to get the latest config block..."
sleep 10
sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp peer0.${HOST} peer channel fetch config /etc/hyperledger/deliver/config_block.pb -c "${CHANNEL}"
sed "s/\${CHANNEL}/${CHANNEL}/g" template/inviteChannel.sh.template > deliver/inviteChannel.sh
sed "s/\${CHANNEL}/${CHANNEL}/g" template/joinChannel.sh.template > deliver/joinChannel.sh
tar -zcvf deliver.tar.gz deliver

set +x
echo "Done."
