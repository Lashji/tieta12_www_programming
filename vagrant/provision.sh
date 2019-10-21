#!/usr/bin/env bash
# Packages
NODE="nodejs"
BUILD_ESSENTIAL="build-essential"
MONGO="mongodb-org"
GIT="git"
MYSQL="mysql-server"
# Prerequisites
GIT_INSTALLED=$(dpkg-query -W --showformat='${Status}\n' $GIT | grep "install ok installed")
echo "Checking for $GIT: $GIT_INSTALLED"
if [ "" == "$GIT_INSTALLED" ]; then
  apt-get update
  apt-get install -y $GIT
fi
# MongoDB
MONGO_INSTALLED=$(dpkg-query -W --showformat='${Status}\n' $MONGO | grep "hold ok installed")
echo "Checking for $MONGO: $MONGO_INSTALLED"
if [ "" == "$MONGO_INSTALLED" ]; then
  wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
  echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
  apt-get update
  sudo apt-get install -y mongodb-org=4.2.0 mongodb-org-server=4.2.0 mongodb-org-shell=4.2.0 mongodb-org-mongos=4.2.0 mongodb-org-tools=4.2.0

  echo "mongodb-org hold" | sudo dpkg --set-selections
  echo "mongodb-org-server hold" | sudo dpkg --set-selections
  echo "mongodb-org-shell hold" | sudo dpkg --set-selections
  echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
  echo "mongodb-org-tools hold" | sudo dpkg --set-selections
  sudo sed -i -e 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf
  sudo service mongod start
  sudo systemctl enable mongod.service
fi
# Node.js
NODE_INSTALLED=$(dpkg-query -W --showformat='${Status}\n' $NODE | grep "install ok installed")
echo "Checking for $NODE: $NODE_INSTALLED"
if [ "" == "$NODE_INSTALLED" ]; then
  curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
  apt-get install -y build-essential nodejs
fi
# MySQL
MYSQL_INSTALLED=$(dpkg-query -W --showformat='${Status}\n' $MYSQL | grep "install ok installed")
echo "Checking for $MYSQL: $MYSQL_INSTALLED"
if [ "" == "$MYSQL_INSTALLED" ]; then
    debconf-set-selections <<< 'mysql-server mysql-server/root_password password MyUnsafePassword'
    debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password MyUnsafePassword'
    apt-get update
    apt-get install -y mysql-server
fi
