#!/bin/bash

# Set the PATH to include Node.js and npm
export PATH=$PATH:/usr/bin/node:/usr/bin/npm

# Set permissions for everything in a directory recursively
chmod -R 644 /home/ec2-user/express-app  # For files
chmod -R 755 /home/ec2-user/express-app  # For directories

# Navigate to your application directory
cd /var/www/myapp

# Install project dependencies using npm
npm install

# Start your Node.js application (e.g., using node)
node server.js