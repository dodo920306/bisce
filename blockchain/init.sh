#!/bin/bash

echo -e "\033[0;32m
                      .coo;                                                                                                                     
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
                      .coo;
\033[0m"

while true;
do
    echo -n "Enter your organization's name: "
    read ORG
    if [[ ! $ORG =~ ^[a-zA-Z0-9]+$ ]]; then
      echo "The name shouldn't include characters that are not letters and numbers."
      continue
    fi
    echo -n -e "The name you enter is \e[1;31m${ORG}\e[0m. This name can't be changed once order set up. Can you confirm that this is correct? (y/n)"
    read confirm
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
      break
    fi
done
while true;
do
    echo -n "Enter your organization's hostname: "
    read HOST
    if [[ ! $HOST =~ ^[a-zA-Z0-9.]+$ ]]; then
      echo "The hostname shouldn't include characters that are not letters, dots and numbers."
      continue
    fi
    echo -n -e "The hostname you enter is \e[1;31m${HOST}\e[0m. This name can't be changed once order set up. Can you confirm that this is correct? (y/n)"
    read confirm
    if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
      break
    fi
done

echo "Welcome ${ORG}!"
set -x

curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
sudo ./install-fabric.sh d b
rm -f install-fabric.sh
sudo cp bin/* /usr/local/bin/
sudo cp -rf bin ../server/app/api/bin

sed "s/\${HOST}/${HOST}/g" template/docker-compose-ca-template.yaml > docker-compose-ca.yaml
sed "s/\${ORG}/${ORG}/" template/.env.ca.template > .env.ca
sed "s/\${HOST}/${HOST}/g" template/docker-compose-template.yaml > docker-compose.yaml
sed -e "s/\${ORG}/${ORG}/g" -e "s/\${HOST}/${HOST}/g" template/.env.orderer.template > .env.orderer
sed -e "s/\${ORG}/${ORG}/g" -e "s/\${HOST}/${HOST}/g" template/.env.peer.template > .env.peer
cp template/.env.couchdb.template .env.couchdb

sudo docker volume create orderer0
sudo docker volume create peer0

sudo chown -R `whoami`:`whoami` .

sed -e "s/\${ORG}/${ORG}/g" -e "s/\${HOST}/${HOST}/g" -e "s/\${PWD}/$(echo "${PWD}" | sed 's/\//\\\//g')/g" template/configtx-template.yaml > config/configtx.yaml

sed -e "s/\${ORG}/${ORG}/g" -e "s/\${HOST}/${HOST}/g" template/setup.sh.template > setup.sh

sed -e "s/\${ORG}/${ORG}/g" -e "s/\${HOST}/${HOST}/g" template/createChannel.sh.template > createChannel.sh

mkdir fabric-ca
sed -e "s/\${ORG}/${ORG}/g" -e "s/\${HOST}/${HOST}/g" template/fabric-ca-server-config.yaml.template > fabric-ca/fabric-ca-server-config.yaml
sed "s/\${ORG}/${ORG}/g" template/fabric-ca-client-config.yaml.template > fabric-ca-client-config.yaml

chmod +x setup.sh createChannel.sh

set +x

echo "Initiation complete."
