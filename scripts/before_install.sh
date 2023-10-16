#!/bin/bash


# Install Node.js and npm
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify the installation
node -v
npm -v

# Stop your Node.js application (if it's running)
pm2 stop server.js