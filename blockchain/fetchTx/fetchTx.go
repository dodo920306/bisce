/*
Copyright 2021 IBM All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"crypto/x509"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"time"
	"context"
	"bufio"
	"strconv"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"github.com/hyperledger/fabric-gateway/pkg/identity"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

var (
	mspID        = os.Getenv("CORE_PEER_LOCALMSPID")
	cryptoPath   = os.Getenv("CORE_PEER_MSPCONFIGPATH")
	certPath     = cryptoPath + "/signcerts/cert.pem"
	keyPath      = cryptoPath + "/keystore/"
	tlsCertPath  = os.Getenv("CORE_PEER_TLS_ROOTCERT_FILE")
	peerEndpoint = os.Getenv("CORE_PEER_ADDRESS")
	gatewayPeer  = os.Getenv("CORE_PEER_ID")
)

type ChaincodeEvent struct {
    BlockNumber    int    `json:"BlockNumber"`
    TransactionID  string `json:"TransactionID"`
    ChaincodeName  string `json:"ChaincodeName"`
    EventName      string `json:"EventName"`
    Payload        string `json:"Payload"`
	Timestamp      string `json:"Timestamp"`
}

type Payload struct {
	Header struct {
		ChannelHeader struct {
			TxID      string `json:"tx_id"`
			Timestamp string `json:"timestamp"`
		} `json:"channel_header"`
	} `json:"header"`
}

type Response struct {
	Data struct {
		Data []struct {
			Payload Payload `json:"payload"`
		} `json:"data"`
	} `json:"data"`
}

func main() {
	clientConnection := newGrpcConnection()
	defer clientConnection.Close()

	id := newIdentity()
	sign := newSign()

	// Create a Gateway connection for a specific client identity
	gw, err := client.Connect(
		id,
		client.WithSign(sign),
		client.WithClientConnection(clientConnection),
		// Default timeouts for different gRPC calls
		client.WithEvaluateTimeout(5*time.Second),
		client.WithEndorseTimeout(15*time.Second),
		client.WithSubmitTimeout(5*time.Second),
		client.WithCommitStatusTimeout(1*time.Minute),
	)
	if err != nil {
		panic(err)
	}
	defer gw.Close()

	// Override default values for chaincode and channel name as they may differ in testing contexts.
	chaincodeName := "bisce"
	if ccname := os.Getenv("CHAINCODE_NAME"); ccname != "" {
		chaincodeName = ccname
	}

	channelName := "biscechannel1"
	if cname := os.Getenv("CHANNEL_NAME"); cname != "" {
		channelName = cname
	}

	network := gw.GetNetwork(channelName)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	events, err := network.ChaincodeEvents(ctx, chaincodeName, client.WithStartBlock(0))
	if err != nil {
		panic(err)
	}
	
	for {
		select {
		case event, ok := <-events:
			if !ok {
				// channel closed
				return
			}

			chaincodeevent := ChaincodeEvent{
				BlockNumber: int(event.BlockNumber),
				TransactionID: event.TransactionID,
				ChaincodeName: event.ChaincodeName,
				EventName: event.EventName,
				Payload: string(event.Payload),
				Timestamp: "",
			}

			file, err := os.Open("/etc/hyperledger/fetchBlock/" + channelName + "_" + strconv.Itoa(chaincodeevent.BlockNumber) + ".json")
			if err != nil {
				fmt.Errorf("無法開啟檔案:", err)
				return
			}
			defer file.Close()
			// 使用 bufio 讀取器讀取檔案內容
			reader := bufio.NewReader(file)

			// 讀取檔案內容
			decoder := json.NewDecoder(reader)
			// 迭代 JSON 物件
			for decoder.More() {
				var response Response
				err = decoder.Decode(&response)
				if err != nil {
					fmt.Errorf("解析 JSON 檔案時出錯:", err)
					return
				}

				// 迭代 data.data[]，尋找符合條件的物件
				for _, data := range response.Data.Data {
					if data.Payload.Header.ChannelHeader.TxID == chaincodeevent.TransactionID {
						t, err := time.Parse(time.RFC3339Nano, data.Payload.Header.ChannelHeader.Timestamp)
						if err != nil {
							fmt.Errorf("Error:", err)
							return
						}
						loc, err := time.LoadLocation("")
						if err != nil {
							fmt.Errorf("Error:", err)
							return
						}
						t = t.In(loc)
						chaincodeevent.Timestamp = t.Format("2006/01/02 15:04:05")
						break
					}
				}
			}

			eventJson, err := json.Marshal(chaincodeevent)
			if err != nil {
				fmt.Errorf("Error:", err)
				return
			}
			fmt.Printf("%s\n", eventJson)
	
		case <-time.After(1 * time.Second):
			// timeout, cancel the context to stop receiving events
			cancel()
			return
		}
	}
}

// newGrpcConnection creates a gRPC connection to the Gateway server.
func newGrpcConnection() *grpc.ClientConn {
	certificate, err := loadCertificate(tlsCertPath)
	if err != nil {
		panic(err)
	}

	certPool := x509.NewCertPool()
	certPool.AddCert(certificate)
	transportCredentials := credentials.NewClientTLSFromCert(certPool, gatewayPeer)

	connection, err := grpc.Dial(peerEndpoint, grpc.WithTransportCredentials(transportCredentials))
	if err != nil {
		panic(fmt.Errorf("failed to create gRPC connection: %w", err))
	}

	return connection
}

// newIdentity creates a client identity for this Gateway connection using an X.509 certificate.
func newIdentity() *identity.X509Identity {
	certificate, err := loadCertificate(certPath)
	if err != nil {
		panic(err)
	}

	id, err := identity.NewX509Identity(mspID, certificate)
	if err != nil {
		panic(err)
	}

	return id
}

func loadCertificate(filename string) (*x509.Certificate, error) {
	certificatePEM, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read certificate file: %w", err)
	}
	return identity.CertificateFromPEM(certificatePEM)
}

// newSign creates a function that generates a digital signature from a message digest using a private key.
func newSign() identity.Sign {
	files, err := os.ReadDir(keyPath)
	if err != nil {
		panic(fmt.Errorf("failed to read private key directory: %w", err))
	}
	privateKeyPEM, err := os.ReadFile(path.Join(keyPath, files[0].Name()))

	if err != nil {
		panic(fmt.Errorf("failed to read private key file: %w", err))
	}

	privateKey, err := identity.PrivateKeyFromPEM(privateKeyPEM)
	if err != nil {
		panic(err)
	}

	sign, err := identity.NewPrivateKeySign(privateKey)
	if err != nil {
		panic(err)
	}

	return sign
}

