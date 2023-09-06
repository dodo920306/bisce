#!/bin/bash

export FABRIC_CFG_PATH=/etc/hyperledger/config
block_filename=biscechannel1

height=$(peer channel getinfo -c ${block_filename} | grep -oP '(?<="height":)\d+')

# 設定預設區塊檔名

for ((i=0; i<$height; i++))
do
  # 判斷區塊檔案是否已存在
  if ! [ -f "${block_filename}_$i.json" ]
  then
    # 取得對應區塊的資訊
    peer channel fetch $i /etc/hyperledger/fetchBlock/${block_filename}_$i.block -c ${block_filename} 2> /dev/null
    /etc/hyperledger/bin/configtxlator proto_decode --input /etc/hyperledger/fetchBlock/${block_filename}_$i.block --type common.Block --output /etc/hyperledger/fetchBlock/${block_filename}_$i.json
    
    # 刪除區塊檔案
    rm /etc/hyperledger/fetchBlock/${block_filename}_$i.block
    chmod 777 /etc/hyperledger/fetchBlock/${block_filename}_$i.json
  fi
done