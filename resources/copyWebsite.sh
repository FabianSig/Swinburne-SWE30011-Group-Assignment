#!/bin/bash

SOURCE_DIR="$(dirname "$PWD")/frontend"
DEST_DIR="/var/www/html/"

sudo cp "${SOURCE_DIR}/index.html" "${DEST_DIR}"
sudo cp "${SOURCE_DIR}/script.js" "${DEST_DIR}"

echo "Files have been copied to ${DEST_DIR}"

