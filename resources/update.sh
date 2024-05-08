#!/bin/bash
# Execute kill script
./kill.sh
if [ $? -ne 0 ]; then
    echo "Failed to execute kill.sh. Exiting."
    exit 1
fi



# Pull the latest changes from the git repository
git pull
if [ $? -ne 0 ]; then
    echo "Failed to pull from git. Exiting."
    exit 1
fi



# Stop the website
./copyWebsite.sh
if [ $? -ne 0 ]; then
    echo "Failed to stop the website. Exiting."
    exit 1
fi



echo 
# Start the website
./start.sh
if [ $? -ne 0 ]; then
    echo "Failed to start with start.sh. Exiting."
    exit 1
fi



echo "Operations completed successfully."
