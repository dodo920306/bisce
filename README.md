# BISCE
![logo](https://user-images.githubusercontent.com/74814435/233967208-6be13513-f1dc-4246-9b19-5849ce11ce74.png)

## Overview
**Warning: Do not use this project in production purposes.**

This repository contains the source code of a web-based platform called "Blockchain-based Inventory of Scope-3 Carbon Emissions". The platform is designed to simulate carbon transactions between users on the Hyperledger Fabric blockchain. It has a React frontend and a Django backend and allows users to interact with an ERC-20 smart contract deployed on chain. 

The website offers user authentication through JWT of Django Rest Framework, and then users can act as different identities on the blockchain with their own special ID as address and msp.

This project is still under development, and we welcome any suggestions for improvement. You can help us identify issues by using the "Issues" tab above. Your feedback is valuable, and we appreciate your contribution to the project's development.

If you want to understand more detail and also happen to be able to read in traditional Chinese, you can check out the powerpoint [here](https://docs.google.com/presentation/d/18R2ygUikURfjTdJtzM67ym33f1UPxzSckpC85smQbc0/edit?usp=sharing). Nevertheless, you can get most information about how to set up this project in the following description.

## Environment
The only environment used in experiments is Ubuntu 20.04. Any problem caused by trying to set this up in different environments is unknown.

## Prerequisite
* git

* curl

* Docker

* Docker-compose

* python3.9

* python3.9 venv

* jq

    You can install all of these by the following comments in ubuntu:

    ```bash
    $ sudo apt-get update
    $ sudo apt-get install git curl docker-compose python3.9 python3.9-venv jq -y
    ```

    Otherwise, you should check their docs to make sure how to install them in your system properly.

    You can also use this to make sure the Docker daemon is running:

    ```bash
    $ sudo systemctl start docker
    ```

* npm

    You can get more information about how to install this in the [nvm github](https://github.com/nvm-sh/nvm) README.

    The npm version should not be too old, or it may cause bugs. (Specific version is unknown.)

* tar

* go (optional)

## Installation
1. Go to the directory you want to install this.

1. Clone this repository:
    ```bash
    $ git clone https://github.com/dodo920306/BISCE.git
    ```

Now you're ready to set this up.

## Set up
As you might notice, the directory structure can be splitted into three main parts:

1. blockchain
1. backend
1. frontend

This is the exact order you should follow to build up the project. Any other order can cause unknown bugs.

Before we get into it, you should consider that you want to be a channel joiner or creater. That means the following steps will be different from your identity. Because currently the multi-channel network is not supported yet, your organization cannot be a channel joiner and creater at the same time.

If you're a channel creater, I assume that you should be the network creater at the same time. That means you should bring up an overlay network with Docker Swarm. You should get your public network ip first and run

```bash
$ sudo docker swarm init --advertise-addr <your ip address>
$ sudo docker network create --attachable --driver overlay bisce-network
```

You shouldn't change the network name from "bisce-network".

If you want to let others join the network, please run

```bash
$ sudo docker swarm join-token manager
```

and give the output instructions to them.

If you're a joiner, follow the output from the above comment run by the creater, with your own public ip.

```bash
$ <output from join-token manager> --advertise-addr <your ip>
```

### blockchain
Go to the directory.

```bash
$ cd BISCE/blockchain
```

Run the initialization.

```bash
$ ./init.sh
```

It will ask your organization's name and hostname. Please remember them because we will use them later. Neither of them should be as same as others'.

The script should generate the config files that will be used later according to your input.

Set up the organization CA and containers.

```bash
$ ./setup.sh
```

You may want to check what this has done by

```bash
$ sudo docker ps
```

If nothing wrong, you should have four containers running as your `peer`, `orderer`, `couchdb` (ledger), and `ca`.

If you're a creater, run

```bash
$ ./createChannel.sh
```

After that, you may see a tarball called `deliver.tar.gz`, that will be the file you need to give to joiners.

As a joiner, once you get `deliver.tar.gz`, you should place it under your `BISCE/blockchain`.

Then run

```bash
$ tar -zxvf deliver.tar.gz
```

You may notice that a directory named `deliver` has been created under `BISCE/blockchain`. Run

```bash
$ cd deliver
$ chmod a+x inviteChannel.sh joinChannel.sh
$ ./inviteChannel.sh
```

to create the channel config that includes your organzations.

After that, you may notice that there is a file named `update_in_envelope.pb` has been created, and you should give it to most of the organizations that are already in the channel.

As a organization that is already in the channel, place the `update_in_envelope.pb` given by the joiners under `BISCE/blockchain` and use

```bash
$ sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp $(sudo docker ps --filter "name=^peer0.*" --format "{{.Names}}") peer channel signconfigtx -f /etc/hyperledger/update_in_envelope.pb
```

to sign for the config, and use

```bash
$ sudo docker exec -e CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/users/admin/msp $(sudo docker ps --filter "name=^peer0.*" --format "{{.Names}}") peer channel update -f /etc/hyperledger/update_in_envelope.pb -c biscechannel1 -o $(sudo docker ps --filter "name=^orderer0.*" --format "{{.Names}}"):7050 --tls --cafile /etc/hyperledger/peers/peer0/tls/ca.crt
```

to update the channel to include the joinners once most of members in the channel has signed for it.

Once the joiners are sure that they are in the channel, run

```bash
$ ./joinChannel.sh
```

under the deliver diretory to let themselves in.

#### The chaincode

As you can see there's a directory named `chaincode` under the blockchain directory. The chaincode inside will be installed when `createChannel.sh` or `joinChannel.sh` are executed for channel creaters and joiners respectively. Nevertheless, the content inside the chaincode does not matter to the set up process, so you can change it as you like if you want to. However, the website set up later is specifically designed for the original chaincode, so once you change the content you should not use the website here anymore.

#### Note
All scripts in the `BISCE/directory` directory we use here are independent for the other parts of the project. That means you can use this to build your own Hyperledger Fabric network on multi-host.

#### Troubleshooting
All logs can be seen by

```bash
$ ./logs.sh
```

If you encounter a tls problem, you may want to consult [this](https://stackoverflow.com/questions/76990991/tls-handshake-failed-with-error-eof-when-deploying-hyperledger-fabric-on-multi-h).

### backend
Once the blockchain has been set up, you may consider set up the backend next.

Go to the directory.

```bash
$ cd ../backend
```

Set up the virtual environment.

```bash
$ python3.9 -m venv env
$ . env/bin/activate
```

Install the requirements.

```bash
$ pip install -r requirements.txt
```

Run the server.

```
$ python3.9 manage.py migrate
$ python3.9 manage.py runserver 0.0.0.0:8000
```

Keep the shell process alive to keep it on, or you might consider use `screen` to run it in the background.

You can open another shell to set up frontend next.

### frontend
Go to the directory.

```bash
$ cd ../frontend
```

Install the requirements.

```bash
$ npm install
```

Run the webpage.

```bash
$ npm start
```

Keep the shell process alive to keep it on, or you might consider use `screen` to run it in the background.

Now, go to `http://<your ip>:3000` to see the website. You can sign up users there and login in to do transactions.

## Usage
The current project is kind of buggy and isn't designed while considering security.

Therefore, as mentioned before, **please do not use this in production purposes.** The only purpose to use this is experiments and development.

## Improvement
The following is the improvements you may consider to contribute.

* Add orderer bft consensus

* Dockerize the frontend and backend

* Debug

* Make the whole thing secure

* Add hyperledger explorer

* Make multi-channel available

Happy hacking!
