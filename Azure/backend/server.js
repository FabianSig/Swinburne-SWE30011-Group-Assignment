const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const { initMQTT } = require('./mqttClient');
const { initWebSocket } = require('./websocket');
const { initDatabase } = require('./db');

const app = express();
const server = http.createServer(app);

initMQTT();
initWebSocket(server);
initDatabase();

app.use(express.static('public'));

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
