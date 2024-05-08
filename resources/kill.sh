#!/bin/bash

if pm2 list | grep -q 'nodeServer'; then
    pm2 stop nodeServer
    pm2 delete nodeServer
fi

if pm2 list | grep -q 'dbExport'; then
    pm2 stop dbExport
    pm2 delete dbExport
fi
