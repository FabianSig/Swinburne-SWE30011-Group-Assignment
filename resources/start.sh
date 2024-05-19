pm2 start ../backend/app.js  --name nodeServer&
sleep 2
pm2 start ../backend/master_controller.py --interpreter python --name dbExport
