const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const { initMQTT } = require('./util/mqtt');
const { setWebSocketServer } = require('./util/mqttClient');
const WebSocket = require('ws');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

initMQTT();
setWebSocketServer(server);
initRoutes(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
