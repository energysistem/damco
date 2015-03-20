#!/bin/bash
export PORT=3002
export NODE_ENV=production

./node_modules/forever/bin/forever \
  start \
  -al forever.log \
  -ao out.log \
  -ae err.log \
  server.js
